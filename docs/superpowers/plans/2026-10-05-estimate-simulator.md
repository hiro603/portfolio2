# 料金シミュレーター Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ポートフォリオに、つくるものと分量を選ぶと概算金額が出て、その内訳を持ったまま問い合わせフォームへ進めるページ `/estimate/` を追加する。

**Architecture:** 計算（DOM に触れない純粋な関数）、引き継ぎ（文章化と sessionStorage の読み書き）、画面（フォームの読み取りと描画）の3つの ES Module に分ける。計算と引き継ぎは Node 標準のテストで確かめ、画面はブラウザで確かめる。問い合わせ欄への流し込みは全ページ共通の `assets/js/main.js` から呼ぶので、`contact/index.html` のフォーム部分には触れない。

**Tech Stack:** 素の HTML / SCSS（FLOCSS×BEM、`sass` CLI）/ JavaScript（ES Modules、ビルドなし）/ Node 22 の `node --test`

**Spec:** `docs/superpowers/specs/2026-10-04-estimate-simulator-design.md`

## Global Constraints

- 作業ブランチは `main` から切った `feature/estimate`。push はしない。`netlify` へのマージと FTP アップロードはこの計画に含めない（ユーザーが行う）
- `contact/index.html` の変更はヘッダーのナビへの1行追加だけ。フォーム部分は変更しない
- 全ページ noindex を維持する（`<meta name="robots" content="noindex" />`）
- `package.json` は作らない。テストは `node --test <ファイルパス>` で1ファイルずつ指定する（ディレクトリ指定は Node 22.16 では失敗する）
- JavaScript は既存に合わせる: インデント4スペース、シングルクォート、`export const initializeXxx = () => {}`、ファイル先頭に JSDoc 形式の1行説明
- SCSS は既存に合わせる: インデント2スペース、`@use "../../foundation" as f;`、色・余白・書体はトークン（`var(--…)`）だけを使う、メディアクエリは `@include f.mq()`（既定 768px）と `f.mq(lg)`（1024px）
- CSS のビルドは `sass assets/scss/style.scss assets/css/style.css --no-source-map`
- 単価（税抜）: トップ 30,000円 / 下層・標準 10,000円 / 下層・複雑 20,000円 / LP 40,000円（10セクション以下）/ LP 長尺 50,000〜60,000円（11セクション以上）/ フォーム 20,000円 / スライダー 5,000円×箇所 / スクロール演出 10,000円 / 公開作業 5,000円
- 税込は 10% を加えて1円未満を切り捨てる
- 入力の範囲: 下層・標準 0〜30、下層・複雑 0〜30、LPセクション 1〜20、スライダー 0〜10
- 単価を書く場所は `assets/js/component/estimate-calc.js` の `PRICES` と、`estimate/index.html` の `<noscript>` 内の単価表の2か所だけ。画面の選択肢のラベルには金額を書かない
- 成果の断定や架空の顧客の声は書かない
- コメントは書かない（理由が非自明な場合のみ1行）。未使用の変数・関数を残さない

## Review Focus

- 数量欄に小数・負数・範囲外の大きな数・文字が入ったとき、範囲内の最も近い整数として計算され、表示が `NaN` にならない（Task 1 のテスト）
- 数量欄を打ち直す途中で欄が空になった瞬間も、合計が正しい金額で表示され続ける（Task 1 のテスト）
- 種類を「サイト」から「LP」に切り替えたあと、隠れた下層ページ数が合計に混ざらない。逆も同じ（Task 1 のテスト）
- 問い合わせ欄に既に文字があるときは上書きしない。sessionStorage が使えない環境でも例外で止まらず問い合わせページへ進める。一度流し込んだ結果は次の訪問で再び入らない（Task 2 のテスト）
- ブラウザの「戻る」でシミュレーターに戻ったとき、復元された入力値と表示中の金額が一致する。数量欄で Enter を押してもページが再読み込みされない（Task 5 のブラウザ確認）

---

### Task 1: 計算

**Files:**
- Create: `assets/js/component/estimate-calc.js`
- Test: `tests/estimate-calc.test.mjs`

**Interfaces:**
- Consumes: なし
- Produces:
  - `PRICES`: 単価の定数オブジェクト
  - `LIMITS`: `{ subStandard, subComplex, lpSections, sliders }`。各値は `{ min: number, max: number }`
  - `clampInteger(value: unknown, limit: { min, max }): number`
  - `addTax(amount: number): number`
  - `calculateEstimate(rawInput): Estimate`
    - `rawInput`: `{ type, subStandard, subComplex, lpSections, sliders, hasForm, hasMotion, hasPublish }`。数量は文字列でも数値でもよい
    - `Estimate`: `{ type: 'site' | 'lp', items: Item[], subtotalMin, subtotalMax, totalMin, totalMax }`
    - `Item`: `{ label: string, quantity: number | null, min: number, max: number }`
  - `formatAmount(min: number, max: number): string`（例: `'30,000円'`、`'50,000〜60,000円'`）
  - `formatItemName(item: Item): string`（例: `'下層ページ（標準） ×4'`、`'お問い合わせフォーム'`）

- [ ] **Step 1: ブランチを切る**

```bash
cd ~/dev/personal/portfolio2
git switch main
git status --short
git switch -c feature/estimate
```

Expected: `git status --short` には `docs/superpowers/` の未追跡ファイルだけが出る。それ以外の変更が出たら止めて報告する。

- [ ] **Step 2: 失敗するテストを書く**

`tests/estimate-calc.test.mjs` を作る。

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    LIMITS,
    addTax,
    calculateEstimate,
    clampInteger,
    formatAmount,
    formatItemName,
} from '../assets/js/component/estimate-calc.js';

const siteInput = {
    type: 'site',
    subStandard: 0,
    subComplex: 0,
    lpSections: 10,
    sliders: 0,
    hasForm: false,
    hasMotion: false,
    hasPublish: false,
};

const lpInput = { ...siteInput, type: 'lp' };

test('サイトはトップページ1枚だけでも 30,000円になる', () => {
    const estimate = calculateEstimate(siteInput);

    assert.equal(estimate.type, 'site');
    assert.deepEqual(estimate.items, [
        { label: 'トップページコーディング', quantity: 1, min: 30000, max: 30000 },
    ]);
    assert.equal(estimate.subtotalMin, 30000);
    assert.equal(estimate.subtotalMax, 30000);
    assert.equal(estimate.totalMin, 33000);
    assert.equal(estimate.totalMax, 33000);
});

test('下層ページは標準 10,000円・複雑 20,000円を枚数分足す', () => {
    const estimate = calculateEstimate({ ...siteInput, subStandard: 4, subComplex: 2 });

    assert.deepEqual(estimate.items, [
        { label: 'トップページコーディング', quantity: 1, min: 30000, max: 30000 },
        { label: '下層ページ（標準）', quantity: 4, min: 40000, max: 40000 },
        { label: '下層ページ（複雑）', quantity: 2, min: 40000, max: 40000 },
    ]);
    assert.equal(estimate.subtotalMin, 110000);
    assert.equal(estimate.totalMin, 121000);
});

test('LP は 10 セクションまで 40,000円', () => {
    const estimate = calculateEstimate({ ...lpInput, lpSections: 10 });

    assert.equal(estimate.type, 'lp');
    assert.deepEqual(estimate.items, [
        { label: 'LPコーディング（10セクション）', quantity: null, min: 40000, max: 40000 },
    ]);
    assert.equal(estimate.subtotalMin, 40000);
    assert.equal(estimate.subtotalMax, 40000);
});

test('LP は 11 セクション以上で 50,000〜60,000円の幅になる', () => {
    const estimate = calculateEstimate({ ...lpInput, lpSections: 11 });

    assert.deepEqual(estimate.items, [
        { label: 'LPコーディング（11セクション）', quantity: null, min: 50000, max: 60000 },
    ]);
    assert.equal(estimate.subtotalMin, 50000);
    assert.equal(estimate.subtotalMax, 60000);
    assert.equal(estimate.totalMin, 55000);
    assert.equal(estimate.totalMax, 66000);
});

test('オプションは選んだものだけ内訳に出て合計に足される', () => {
    const estimate = calculateEstimate({
        ...siteInput,
        hasForm: true,
        sliders: 2,
        hasMotion: true,
        hasPublish: true,
    });

    assert.deepEqual(estimate.items, [
        { label: 'トップページコーディング', quantity: 1, min: 30000, max: 30000 },
        { label: 'お問い合わせフォーム', quantity: null, min: 20000, max: 20000 },
        { label: 'スライダー', quantity: 2, min: 10000, max: 10000 },
        { label: 'スクロール演出', quantity: null, min: 10000, max: 10000 },
        { label: '公開作業', quantity: null, min: 5000, max: 5000 },
    ]);
    assert.equal(estimate.subtotalMin, 75000);
    assert.equal(estimate.totalMin, 82500);
});

test('幅のある LP にオプションを足すと下限と上限の両方に加算される', () => {
    const estimate = calculateEstimate({ ...lpInput, lpSections: 15, hasForm: true, sliders: 1 });

    assert.equal(estimate.subtotalMin, 75000);
    assert.equal(estimate.subtotalMax, 85000);
    assert.equal(estimate.totalMin, 82500);
    assert.equal(estimate.totalMax, 93500);
});

test('スライダー 0 箇所は内訳に出ない', () => {
    const estimate = calculateEstimate({ ...siteInput, sliders: 0 });

    assert.equal(estimate.items.some((item) => item.label === 'スライダー'), false);
});

test('LP を選んだときは下層ページ数が合計に混ざらない', () => {
    const estimate = calculateEstimate({ ...lpInput, subStandard: 5, subComplex: 3 });

    assert.equal(estimate.items.length, 1);
    assert.equal(estimate.subtotalMin, 40000);
});

test('サイトを選んだときは LP のセクション数が合計に混ざらない', () => {
    const estimate = calculateEstimate({ ...siteInput, lpSections: 20 });

    assert.equal(estimate.items.length, 1);
    assert.equal(estimate.subtotalMin, 30000);
    assert.equal(estimate.subtotalMax, 30000);
});

test('種類が不明なときはサイトとして計算する', () => {
    const estimate = calculateEstimate({ ...siteInput, type: null });

    assert.equal(estimate.type, 'site');
    assert.equal(estimate.subtotalMin, 30000);
});

test('clampInteger は小数を四捨五入し、範囲外を範囲の端に寄せる', () => {
    assert.equal(clampInteger('2.5', LIMITS.sliders), 3);
    assert.equal(clampInteger('2.4', LIMITS.sliders), 2);
    assert.equal(clampInteger('-3', LIMITS.sliders), 0);
    assert.equal(clampInteger('-0.4', LIMITS.sliders), 0);
    assert.equal(clampInteger('999', LIMITS.sliders), 10);
    assert.equal(clampInteger('1e9', LIMITS.subStandard), 30);
});

test('clampInteger は空欄や文字を下限にする', () => {
    assert.equal(clampInteger('', LIMITS.sliders), 0);
    assert.equal(clampInteger('', LIMITS.lpSections), 1);
    assert.equal(clampInteger('abc', LIMITS.lpSections), 1);
    assert.equal(clampInteger(null, LIMITS.lpSections), 1);
    assert.equal(clampInteger(undefined, LIMITS.lpSections), 1);
});

test('数量が空欄や文字でも合計は数値になる', () => {
    const estimate = calculateEstimate({
        ...siteInput,
        subStandard: '',
        subComplex: 'abc',
        sliders: '-2',
    });

    assert.equal(estimate.subtotalMin, 30000);
    assert.equal(Number.isInteger(estimate.totalMin), true);
});

test('LP のセクション数が空欄なら 1 セクションとして 40,000円', () => {
    const estimate = calculateEstimate({ ...lpInput, lpSections: '' });

    assert.equal(estimate.items[0].label, 'LPコーディング（1セクション）');
    assert.equal(estimate.subtotalMin, 40000);
});

test('範囲を超えた枚数は上限で計算する', () => {
    const estimate = calculateEstimate({ ...siteInput, subStandard: '500' });

    assert.equal(estimate.items[1].quantity, 30);
    assert.equal(estimate.subtotalMin, 330000);
});

test('addTax は 10% を足して1円未満を切り捨てる', () => {
    assert.equal(addTax(30000), 33000);
    assert.equal(addTax(1005), 1105);
    assert.equal(addTax(0), 0);
});

test('formatAmount は同額なら1つ、幅があれば「〜」でつなぐ', () => {
    assert.equal(formatAmount(30000, 30000), '30,000円');
    assert.equal(formatAmount(50000, 60000), '50,000〜60,000円');
});

test('formatItemName は数量があるときだけ「×数量」を付ける', () => {
    assert.equal(
        formatItemName({ label: '下層ページ（標準）', quantity: 4, min: 40000, max: 40000 }),
        '下層ページ（標準） ×4',
    );
    assert.equal(
        formatItemName({ label: 'お問い合わせフォーム', quantity: null, min: 20000, max: 20000 }),
        'お問い合わせフォーム',
    );
});
```

- [ ] **Step 3: テストが失敗することを確かめる**

Run: `node --test tests/estimate-calc.test.mjs`
Expected: FAIL。`Cannot find module '…/assets/js/component/estimate-calc.js'` が出る。

- [ ] **Step 4: 実装を書く**

`assets/js/component/estimate-calc.js` を作る。

```js
/**
 * 料金シミュレーターの計算（入力値から内訳と合計を返す。DOMに触れない）
 */
export const PRICES = {
    top: 30000,
    subStandard: 10000,
    subComplex: 20000,
    lp: 40000,
    lpLongMin: 50000,
    lpLongMax: 60000,
    form: 20000,
    slider: 5000,
    motion: 10000,
    publish: 5000,
};

export const LIMITS = {
    subStandard: { min: 0, max: 30 },
    subComplex: { min: 0, max: 30 },
    lpSections: { min: 1, max: 20 },
    sliders: { min: 0, max: 10 },
};

const LP_STANDARD_SECTIONS = 10;
const TAX_PERCENT = 10;

const numberFormat = new Intl.NumberFormat('ja-JP');

export const clampInteger = (value, { min, max }) => {
    const number = Math.round(Number(value));

    if (!Number.isFinite(number)) return min;

    return Math.min(max, Math.max(min, number));
};

export const addTax = (amount) => Math.floor((amount * (100 + TAX_PERCENT)) / 100);

export const formatAmount = (min, max) => {
    if (min === max) return `${numberFormat.format(min)}円`;

    return `${numberFormat.format(min)}〜${numberFormat.format(max)}円`;
};

export const formatItemName = (item) => {
    if (item.quantity === null) return item.label;

    return `${item.label} ×${item.quantity}`;
};

const createItem = (label, quantity, min, max = min) => ({ label, quantity, min, max });

const createSiteItems = (rawInput) => {
    const subStandard = clampInteger(rawInput.subStandard, LIMITS.subStandard);
    const subComplex = clampInteger(rawInput.subComplex, LIMITS.subComplex);
    const items = [createItem('トップページコーディング', 1, PRICES.top)];

    if (subStandard > 0) {
        items.push(createItem('下層ページ（標準）', subStandard, PRICES.subStandard * subStandard));
    }

    if (subComplex > 0) {
        items.push(createItem('下層ページ（複雑）', subComplex, PRICES.subComplex * subComplex));
    }

    return items;
};

const createLpItems = (rawInput) => {
    const sections = clampInteger(rawInput.lpSections, LIMITS.lpSections);
    const label = `LPコーディング（${sections}セクション）`;

    if (sections <= LP_STANDARD_SECTIONS) return [createItem(label, null, PRICES.lp)];

    return [createItem(label, null, PRICES.lpLongMin, PRICES.lpLongMax)];
};

const sumBy = (items, key) => items.reduce((total, item) => total + item[key], 0);

export const calculateEstimate = (rawInput) => {
    const type = rawInput.type === 'lp' ? 'lp' : 'site';
    const sliders = clampInteger(rawInput.sliders, LIMITS.sliders);
    const items = type === 'lp' ? createLpItems(rawInput) : createSiteItems(rawInput);

    if (rawInput.hasForm) items.push(createItem('お問い合わせフォーム', null, PRICES.form));
    if (sliders > 0) items.push(createItem('スライダー', sliders, PRICES.slider * sliders));
    if (rawInput.hasMotion) items.push(createItem('スクロール演出', null, PRICES.motion));
    if (rawInput.hasPublish) items.push(createItem('公開作業', null, PRICES.publish));

    const subtotalMin = sumBy(items, 'min');
    const subtotalMax = sumBy(items, 'max');

    return {
        type,
        items,
        subtotalMin,
        subtotalMax,
        totalMin: addTax(subtotalMin),
        totalMax: addTax(subtotalMax),
    };
};
```

- [ ] **Step 5: テストが通ることを確かめる**

Run: `node --test tests/estimate-calc.test.mjs`
Expected: PASS。`# pass 18` `# fail 0`。

- [ ] **Step 6: lint を通す**

Run: `npx eslint assets/js/component/estimate-calc.js`
Expected: 何も出力されない（エラー0件）。

- [ ] **Step 7: コミット**

```bash
git add docs/superpowers/specs/2026-10-04-estimate-simulator-design.md docs/superpowers/plans/2026-10-05-estimate-simulator.md tests/estimate-calc.test.mjs assets/js/component/estimate-calc.js
git status --short
git commit -m "料金シミュレーターの計算を追加"
```

Expected: `git status --short` に `config.php`・`.env`・`outbox/` が含まれていないこと。

---

### Task 2: 問い合わせへの引き継ぎ

**Files:**
- Create: `assets/js/component/estimate-handoff.js`
- Modify: `assets/js/main.js`
- Test: `tests/estimate-handoff.test.mjs`

**Interfaces:**
- Consumes（Task 1 の `assets/js/component/estimate-calc.js`）:
  - `calculateEstimate(rawInput): Estimate`（テストで使う）
  - `formatAmount(min, max): string`
  - `formatItemName(item): string`
- Produces:
  - `buildSummaryText(estimate: Estimate): string`
  - `saveSummary(text: string, getStorage?: () => Storage): void`
  - `takeSummary(getStorage?: () => Storage): string | null`（読み出すと同時に保存を消す）
  - `fillMessage(messageElement: { value: string }, text: string | null): void`
  - `initializeEstimateHandoff(): void`（ページに `#message` があるときだけ流し込む）

- [ ] **Step 1: 失敗するテストを書く**

`tests/estimate-handoff.test.mjs` を作る。

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimate } from '../assets/js/component/estimate-calc.js';
import {
    buildSummaryText,
    fillMessage,
    saveSummary,
    takeSummary,
} from '../assets/js/component/estimate-handoff.js';

const createStorage = () => {
    const values = new Map();

    return {
        getItem: (key) => (values.has(key) ? values.get(key) : null),
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key),
    };
};

const throwOnAccess = () => {
    throw new Error('storage is blocked');
};

test('サイトの内訳を問い合わせ用の文章にする', () => {
    const estimate = calculateEstimate({
        type: 'site',
        subStandard: 4,
        subComplex: 0,
        lpSections: 10,
        sliders: 0,
        hasForm: true,
        hasMotion: false,
        hasPublish: false,
    });

    assert.equal(
        buildSummaryText(estimate),
        [
            '【料金シミュレーターの結果】',
            '種類: サイト（複数ページ）',
            '・トップページコーディング ×1 30,000円',
            '・下層ページ（標準） ×4 40,000円',
            '・お問い合わせフォーム 20,000円',
            '概算合計: 90,000円（税抜）／99,000円（税込）',
        ].join('\n'),
    );
});

test('幅のある LP は合計も幅で書く', () => {
    const estimate = calculateEstimate({
        type: 'lp',
        subStandard: 0,
        subComplex: 0,
        lpSections: 12,
        sliders: 0,
        hasForm: false,
        hasMotion: false,
        hasPublish: true,
    });

    assert.equal(
        buildSummaryText(estimate),
        [
            '【料金シミュレーターの結果】',
            '種類: LP（1ページ）',
            '・LPコーディング（12セクション） 50,000〜60,000円',
            '・公開作業 5,000円',
            '概算合計: 55,000〜65,000円（税抜）／60,500〜71,500円（税込）',
        ].join('\n'),
    );
});

test('保存した文章は一度だけ取り出せる', () => {
    const storage = createStorage();
    const getStorage = () => storage;

    saveSummary('結果', getStorage);

    assert.equal(takeSummary(getStorage), '結果');
    assert.equal(takeSummary(getStorage), null);
});

test('何も保存していなければ null を返す', () => {
    const storage = createStorage();

    assert.equal(takeSummary(() => storage), null);
});

test('ストレージが使えなくても例外を出さない', () => {
    assert.doesNotThrow(() => saveSummary('結果', throwOnAccess));
    assert.equal(takeSummary(throwOnAccess), null);
});

test('空の問い合わせ欄には文章を入れる', () => {
    const messageElement = { value: '' };

    fillMessage(messageElement, '結果');

    assert.equal(messageElement.value, '結果');
});

test('入力済みの問い合わせ欄は上書きしない', () => {
    const messageElement = { value: '書きかけの相談' };

    fillMessage(messageElement, '結果');

    assert.equal(messageElement.value, '書きかけの相談');
});

test('文章がないときは問い合わせ欄を変えない', () => {
    const messageElement = { value: '' };

    fillMessage(messageElement, null);

    assert.equal(messageElement.value, '');
});
```

- [ ] **Step 2: テストが失敗することを確かめる**

Run: `node --test tests/estimate-handoff.test.mjs`
Expected: FAIL。`Cannot find module '…/assets/js/component/estimate-handoff.js'` が出る。

- [ ] **Step 3: 実装を書く**

`assets/js/component/estimate-handoff.js` を作る。

```js
import { formatAmount, formatItemName } from './estimate-calc.js';

/**
 * 料金シミュレーターの結果を問い合わせフォームへ引き継ぐ
 */
const STORAGE_KEY = 'estimate-summary';

const TYPE_LABELS = {
    site: 'サイト（複数ページ）',
    lp: 'LP（1ページ）',
};

const readSessionStorage = () => window.sessionStorage;

export const buildSummaryText = (estimate) => {
    const itemLines = estimate.items.map(
        (item) => `・${formatItemName(item)} ${formatAmount(item.min, item.max)}`,
    );
    const subtotal = formatAmount(estimate.subtotalMin, estimate.subtotalMax);
    const total = formatAmount(estimate.totalMin, estimate.totalMax);

    return [
        '【料金シミュレーターの結果】',
        `種類: ${TYPE_LABELS[estimate.type]}`,
        ...itemLines,
        `概算合計: ${subtotal}（税抜）／${total}（税込）`,
    ].join('\n');
};

export const saveSummary = (text, getStorage = readSessionStorage) => {
    try {
        getStorage().setItem(STORAGE_KEY, text);
    } catch {
        // 保存できなくても問い合わせページへの移動は止めない
    }
};

export const takeSummary = (getStorage = readSessionStorage) => {
    try {
        const storage = getStorage();
        const text = storage.getItem(STORAGE_KEY);

        storage.removeItem(STORAGE_KEY);

        return text;
    } catch {
        return null;
    }
};

export const fillMessage = (messageElement, text) => {
    if (!text || messageElement.value !== '') return;

    messageElement.value = text;
};

export const initializeEstimateHandoff = () => {
    const messageElement = document.querySelector('#message');

    if (!messageElement) return;

    fillMessage(messageElement, takeSummary());
};
```

- [ ] **Step 4: テストが通ることを確かめる**

Run: `node --test tests/estimate-handoff.test.mjs`
Expected: PASS。`# pass 8` `# fail 0`。

- [ ] **Step 5: main.js から呼ぶ**

`assets/js/main.js` を次の内容に置き換える（import を1行、呼び出しを1行足す）。

```js
import { initializeEstimateHandoff } from "./component/estimate-handoff.js";
import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { initializeHeaderBackgroundToggle } from "./component/header-background-toggle.js";
import { initializeScrollReveal } from "./component/scroll-reveal.js";

gsap.registerPlugin(ScrollTrigger);

initializeHamburgerMenu();
initializeHeaderBackgroundToggle();
initializeScrollReveal();
initializeEstimateHandoff();
```

- [ ] **Step 6: lint を通す**

Run: `npx eslint assets/js`
Expected: 何も出力されない（エラー0件）。

- [ ] **Step 7: ブラウザで流し込みを確かめる**

```bash
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080/contact/index.html` を開き、開発者ツールのコンソールで次を実行してから再読み込みする。

```js
sessionStorage.setItem('estimate-summary', 'テストの結果');
```

Expected:
- 再読み込み後、お問い合わせ内容の欄に「テストの結果」が入っている
- もう一度再読み込みすると欄は空（保存が消えている）
- `http://localhost:8080/index.html` を開いてもコンソールにエラーが出ない（`#message` がないページでは何もしない）

確かめ終わったらサーバーを Ctrl+C で止める。

- [ ] **Step 8: コミット**

```bash
git add tests/estimate-handoff.test.mjs assets/js/component/estimate-handoff.js assets/js/main.js
git status --short
git commit -m "シミュレーター結果を問い合わせ欄へ引き継ぐ処理を追加"
```

---

### Task 3: 画面（HTML とフォームの動き）

**Files:**
- Create: `estimate/index.html`
- Create: `assets/js/component/estimate-form.js`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes:
  - Task 1 `assets/js/component/estimate-calc.js`: `LIMITS`、`calculateEstimate(rawInput)`、`clampInteger(value, limit)`、`formatAmount(min, max)`、`formatItemName(item)`
  - Task 2 `assets/js/component/estimate-handoff.js`: `buildSummaryText(estimate)`、`saveSummary(text)`
- Produces:
  - `initializeEstimateForm(): void`（ページに `.js-estimate-form` があるときだけ動く）
  - HTML のフック（Task 4 の SCSS が使うクラス名もここで確定する）
    - JS 用: `.js-estimate-form` `.js-estimate-site-fields` `.js-estimate-lp-fields` `.js-estimate-items` `.js-estimate-subtotal` `.js-estimate-total` `.js-estimate-handoff`
    - 入力の `name`: `type`（`site` / `lp`）`subStandard` `subComplex` `lpSections` `sliders` `hasForm` `hasMotion` `hasPublish`
    - JS が生成する要素のクラス: `p-estimate__item` `p-estimate__item-price`

- [ ] **Step 1: ページを作る**

`estimate/index.html` を作る。

```html
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Price｜料金シミュレーター — hiro</title>
        <meta name="description" content="つくるものと分量を選ぶと、コーディング費用の概算がその場で分かります。結果を添えてそのままご相談いただけます。" />
        <meta name="format-detection" content="telephone=no, email=no" />

        <!-- Google tag (gtag.js) -->
        <script src="https://www.googletagmanager.com/gtag/js?id=G-8ZN9EN7SE7" defer></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", "G-8ZN9EN7SE7");
        </script>

        <link rel="canonical" href="https://webhiro.com/estimate/" />

        <!-- OGP -->
        <meta property="og:title" content="Price｜料金シミュレーター — hiro" />
        <meta property="og:description" content="つくるものと分量を選ぶと、コーディング費用の概算がその場で分かります。結果を添えてそのままご相談いただけます。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://webhiro.com/estimate/" />
        <meta property="og:image" content="https://webhiro.com/assets/img/ogp.png" />
        <meta property="og:site_name" content="hiro" />
        <meta property="og:locale" content="ja_JP" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Price｜料金シミュレーター — hiro" />
        <meta name="twitter:description" content="つくるものと分量を選ぶと、コーディング費用の概算がその場で分かります。結果を添えてそのままご相談いただけます。" />
        <meta name="twitter:image" content="https://webhiro.com/assets/img/ogp.png" />

        <link rel="icon" href="../assets/img/favicon/favicon.ico" />
        <link rel="icon" href="../assets/img/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="../assets/img/favicon/apple-touch-icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,500&family=Shippori+Mincho:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="../assets/css/style.css" />

        <script src="../assets/js/vendor/gsap.min.js" defer></script>
        <script src="../assets/js/vendor/ScrollTrigger.min.js" defer></script>
        <script type="module" src="../assets/js/main.js"></script>

        <meta name="robots" content="noindex" />
    </head>
    <body>
        <header class="l-header js-header is-active">
            <div class="l-header__inner">
                <a href="../index.html" class="c-site-logo">
                    <span class="c-site-logo__main">hiro<span class="c-site-logo__dot">.</span></span>
                    <span class="c-site-logo__sub">Web Designer &amp; Developer</span>
                </a>
                <button type="button" class="l-header__burger js-header-menu-open" aria-label="メニューを開く">
                    <span></span><span></span>
                </button>
                <dialog class="l-header__menu js-header-menu" aria-label="ナビゲーション">
                    <button type="button" class="l-header__menu-close js-header-menu-close" aria-label="メニューを閉じる">×</button>
                    <nav class="l-header__nav" aria-label="メイン">
                        <ul class="l-header__list">
                            <li><a href="../index.html#works" class="l-header__link">Works</a></li>
                            <li><a href="../index.html#about" class="l-header__link">About</a></li>
                            <li><a href="../index.html#skill" class="l-header__link">Skill</a></li>
                            <li><a href="../index.html#flow" class="l-header__link">Flow</a></li>
                            <li><a href="index.html" class="l-header__link">Price</a></li>
                            <li><a href="../contact/index.html" class="l-header__link l-header__link--cta">Contact</a></li>
                        </ul>
                    </nav>
                </dialog>
            </div>
        </header>

        <main>
            <section class="p-estimate">
                <div class="l-container p-estimate__inner">
                    <nav class="c-breadcrumb" aria-label="パンくず">
                        <ol class="c-breadcrumb-list">
                            <li class="c-breadcrumb-item"><a href="../index.html" class="c-breadcrumb-item-link">Home</a></li>
                            <li class="c-breadcrumb-item">Price</li>
                        </ol>
                    </nav>

                    <p class="p-estimate__label">Price</p>
                    <h1 class="p-estimate__title">料金シミュレーター</h1>
                    <p class="p-estimate__lead">つくるものと分量を選ぶと、コーディング費用の概算がその場で出ます。デザインデータ（Figma など）をご用意いただく場合の金額です。</p>

                    <noscript>
                        <div class="p-estimate__noscript">
                            <p>JavaScript が無効のため、自動計算はご利用いただけません。主な単価（税抜）は次のとおりです。</p>
                            <div class="c-table">
                                <table>
                                    <tbody>
                                        <tr><th scope="row">トップページ</th><td>30,000円</td></tr>
                                        <tr><th scope="row">下層ページ</th><td>10,000円／ページ（複雑なページは 20,000円）</td></tr>
                                        <tr><th scope="row">LP（1ページ）</th><td>40,000円（10セクションまで）</td></tr>
                                        <tr><th scope="row">お問い合わせフォーム</th><td>20,000円</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </noscript>

                    <div class="p-estimate__body">
                        <form class="p-estimate__form js-estimate-form">
                            <fieldset class="p-estimate__group">
                                <legend class="p-estimate__legend">つくるもの</legend>
                                <div class="p-estimate__choices">
                                    <label class="p-estimate__choice">
                                        <input type="radio" name="type" value="site" checked>
                                        <span>サイト（複数ページ）</span>
                                    </label>
                                    <label class="p-estimate__choice">
                                        <input type="radio" name="type" value="lp">
                                        <span>LP（1ページ）</span>
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset class="p-estimate__group js-estimate-site-fields">
                                <legend class="p-estimate__legend">ページ数</legend>
                                <p class="p-estimate__hint">トップページ1枚は必ず含みます。それ以外のページの枚数を入れてください。</p>
                                <div class="c-form__row">
                                    <label class="c-form__label" for="subStandard">下層ページ（標準）</label>
                                    <input class="c-form__input p-estimate__number" type="number" id="subStandard" name="subStandard" min="0" max="30" step="1" value="0" inputmode="numeric">
                                </div>
                                <div class="c-form__row">
                                    <label class="c-form__label" for="subComplex">下層ページ（複雑）</label>
                                    <input class="c-form__input p-estimate__number" type="number" id="subComplex" name="subComplex" min="0" max="30" step="1" value="0" inputmode="numeric" aria-describedby="subComplex-hint">
                                    <p class="p-estimate__hint" id="subComplex-hint">独自のレイアウトが多いページや、要素の多い長いページを指します。</p>
                                </div>
                            </fieldset>

                            <fieldset class="p-estimate__group js-estimate-lp-fields" hidden>
                                <legend class="p-estimate__legend">LP の長さ</legend>
                                <div class="c-form__row">
                                    <label class="c-form__label" for="lpSections">セクション数</label>
                                    <input class="c-form__input p-estimate__number" type="number" id="lpSections" name="lpSections" min="1" max="20" step="1" value="10" inputmode="numeric" aria-describedby="lpSections-hint">
                                    <p class="p-estimate__hint" id="lpSections-hint">ファーストビュー・特徴・料金・よくある質問など、見出しで区切られるまとまりを1つと数えます。</p>
                                </div>
                            </fieldset>

                            <fieldset class="p-estimate__group">
                                <legend class="p-estimate__legend">オプション</legend>
                                <div class="p-estimate__choices p-estimate__choices--column">
                                    <label class="p-estimate__choice">
                                        <input type="checkbox" name="hasForm">
                                        <span>お問い合わせフォーム</span>
                                    </label>
                                    <label class="p-estimate__choice">
                                        <input type="checkbox" name="hasMotion">
                                        <span>スクロール演出（トップまたは LP の1ページ分）</span>
                                    </label>
                                    <label class="p-estimate__choice">
                                        <input type="checkbox" name="hasPublish">
                                        <span>公開作業（サーバーへのアップロードと表示確認）</span>
                                    </label>
                                </div>
                                <div class="c-form__row">
                                    <label class="c-form__label" for="sliders">スライダーの箇所数</label>
                                    <input class="c-form__input p-estimate__number" type="number" id="sliders" name="sliders" min="0" max="10" step="1" value="0" inputmode="numeric">
                                </div>
                            </fieldset>
                        </form>

                        <div class="p-estimate__result">
                            <h2 class="p-estimate__result-title">概算</h2>
                            <div aria-live="polite">
                                <ul class="p-estimate__items js-estimate-items"></ul>
                                <dl class="p-estimate__totals">
                                    <div class="p-estimate__total p-estimate__total--main">
                                        <dt>合計（税抜）</dt>
                                        <dd class="js-estimate-subtotal"></dd>
                                    </div>
                                    <div class="p-estimate__total">
                                        <dt>合計（税込）</dt>
                                        <dd class="js-estimate-total"></dd>
                                    </div>
                                </dl>
                            </div>
                            <a href="../contact/index.html" class="c-button p-estimate__cta js-estimate-handoff">この内容で相談する</a>
                        </div>
                    </div>

                    <section class="p-estimate__notes" aria-labelledby="estimate-notes-title">
                        <h2 class="p-estimate__notes-title" id="estimate-notes-title">ご確認ください</h2>
                        <ul class="p-estimate__notes-list">
                            <li>表示は概算です。正式なお見積りは、内容を伺ってからお出しします。</li>
                            <li>金額に含むもの：デザインの再現、レスポンシブ対応、4ブラウザと実機での確認、画像の最適化、各ページ2回までの修正。</li>
                            <li>金額に含まないもの：デザイン制作、WordPress 化。これらは別途お見積りします。</li>
                            <li>スクロール演出は1ページ分です。2ページ以上に入れる場合はご相談ください。</li>
                            <li>公開作業は、ご用意いただいたサーバーへのアップロードと表示確認までです。サーバー・ドメインの契約や設定、SSL の有効化、DNS の切り替えは別途お見積りします。</li>
                        </ul>
                    </section>
                </div>
            </section>
        </main>

        <footer class="l-footer">
            <div class="l-container l-footer__inner">
                <a href="../index.html" class="l-footer__logo">hiro<span>.</span></a>
                <ul class="l-footer__nav">
                    <li><a href="../index.html#works">Works</a></li>
                    <li><a href="../index.html#about">About</a></li>
                    <li><a href="../contact/index.html">Contact</a></li>
                    <li><a href="../privacy/index.html">Privacy</a></li>
                </ul>
                <small class="l-footer__copy">© 2026 hiro</small>
            </div>
        </footer>
    </body>
</html>
```

- [ ] **Step 2: フォームの動きを書く**

`assets/js/component/estimate-form.js` を作る。

```js
import {
    LIMITS,
    calculateEstimate,
    clampInteger,
    formatAmount,
    formatItemName,
} from './estimate-calc.js';
import { buildSummaryText, saveSummary } from './estimate-handoff.js';

/**
 * 料金シミュレーター（入力のたびに内訳と合計を描き直す）
 */
export const initializeEstimateForm = () => {
    const formElement = document.querySelector('.js-estimate-form');

    if (!formElement) return;

    const siteFieldsElement = formElement.querySelector('.js-estimate-site-fields');
    const lpFieldsElement = formElement.querySelector('.js-estimate-lp-fields');
    const itemsElement = document.querySelector('.js-estimate-items');
    const subtotalElement = document.querySelector('.js-estimate-subtotal');
    const totalElement = document.querySelector('.js-estimate-total');
    const handoffElement = document.querySelector('.js-estimate-handoff');

    const readInput = () => {
        const data = new FormData(formElement);

        return {
            type: data.get('type'),
            subStandard: data.get('subStandard'),
            subComplex: data.get('subComplex'),
            lpSections: data.get('lpSections'),
            sliders: data.get('sliders'),
            hasForm: data.has('hasForm'),
            hasMotion: data.has('hasMotion'),
            hasPublish: data.has('hasPublish'),
        };
    };

    const createItemElement = (item) => {
        const itemElement = document.createElement('li');
        const nameElement = document.createElement('span');
        const priceElement = document.createElement('span');

        itemElement.className = 'p-estimate__item';
        priceElement.className = 'p-estimate__item-price';
        nameElement.textContent = formatItemName(item);
        priceElement.textContent = formatAmount(item.min, item.max);
        itemElement.append(nameElement, priceElement);

        return itemElement;
    };

    const render = () => {
        const estimate = calculateEstimate(readInput());

        siteFieldsElement.hidden = estimate.type !== 'site';
        lpFieldsElement.hidden = estimate.type !== 'lp';
        itemsElement.replaceChildren(...estimate.items.map(createItemElement));
        subtotalElement.textContent = formatAmount(estimate.subtotalMin, estimate.subtotalMax);
        totalElement.textContent = formatAmount(estimate.totalMin, estimate.totalMax);
    };

    const clampField = (fieldElement) => {
        const limit = LIMITS[fieldElement.name];

        if (!limit) return;

        fieldElement.value = clampInteger(fieldElement.value, limit);
    };

    formElement.addEventListener('input', render);
    formElement.addEventListener('change', (event) => {
        clampField(event.target);
        render();
    });
    formElement.addEventListener('submit', (event) => event.preventDefault());
    handoffElement.addEventListener('click', () => {
        saveSummary(buildSummaryText(calculateEstimate(readInput())));
    });
    // 「戻る」で復元された入力値はスクリプト実行後に入ることがあるため、表示時にも描き直す
    window.addEventListener('pageshow', render);

    render();
};
```

- [ ] **Step 3: main.js から呼ぶ**

`assets/js/main.js` を次の内容に置き換える（Task 2 の状態に import を1行、呼び出しを1行足す）。

```js
import { initializeEstimateForm } from "./component/estimate-form.js";
import { initializeEstimateHandoff } from "./component/estimate-handoff.js";
import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { initializeHeaderBackgroundToggle } from "./component/header-background-toggle.js";
import { initializeScrollReveal } from "./component/scroll-reveal.js";

gsap.registerPlugin(ScrollTrigger);

initializeHamburgerMenu();
initializeHeaderBackgroundToggle();
initializeScrollReveal();
initializeEstimateHandoff();
initializeEstimateForm();
```

- [ ] **Step 4: lint と既存テストを通す**

Run: `npx eslint assets/js`
Expected: 何も出力されない（エラー0件）。

Run: `node --test tests/estimate-calc.test.mjs && node --test tests/estimate-handoff.test.mjs`
Expected: どちらも `# fail 0`。

- [ ] **Step 5: ブラウザで動きを確かめる（見た目はまだ整っていなくてよい）**

```bash
python3 -m http.server 8080
```

`http://localhost:8080/estimate/index.html` を開き、次を順に確かめる。コンソールにエラーが出ていないことも見る。

| 操作 | 期待する表示 |
|---|---|
| 開いた直後 | 内訳「トップページコーディング ×1 30,000円」、税抜 30,000円、税込 33,000円。LP の長さの欄は出ていない |
| 下層（標準）を 4 にする | 税抜 70,000円、税込 77,000円 |
| お問い合わせフォームにチェック | 税抜 90,000円、税込 99,000円 |
| 「LP（1ページ）」を選ぶ | ページ数の欄が消え、LP の長さの欄が出る。内訳は「LPコーディング（10セクション） 40,000円」と「お問い合わせフォーム 20,000円」。税抜 60,000円 |
| セクション数を 11 にする | 税抜 70,000〜80,000円、税込 77,000〜88,000円 |
| セクション数の欄を空にする | 金額が `NaN` にならず、税抜 60,000円が出ている |
| セクション数に 99 と入れて欄の外をクリック | 欄の値が 20 に直る |
| スライダーに -3 と入れて欄の外をクリック | 欄の値が 0 に直る |
| 数量欄で Enter を押す | ページが再読み込みされない（URL に `?` が付かない） |
| 「サイト」に戻し、下層（標準）4・フォームありの状態で「この内容で相談する」を押す | 問い合わせページに移動し、お問い合わせ内容の欄に下の文章が入っている |

```
【料金シミュレーターの結果】
種類: サイト（複数ページ）
・トップページコーディング ×1 30,000円
・下層ページ（標準） ×4 40,000円
・お問い合わせフォーム 20,000円
概算合計: 90,000円（税抜）／99,000円（税込）
```

確かめ終わったらサーバーを止める。期待と違う行があれば、その行と実際の表示を記録して直してから次へ進む。

- [ ] **Step 6: コミット**

```bash
git add estimate/index.html assets/js/component/estimate-form.js assets/js/main.js
git status --short
git commit -m "料金シミュレーターのページとフォームの動きを追加"
```

---

### Task 4: スタイル

**Files:**
- Create: `assets/scss/page/estimate/_estimate.scss`
- Modify: `assets/scss/page/_index.scss`
- Modify（ビルド結果）: `assets/css/style.css`

**Interfaces:**
- Consumes: Task 3 の `estimate/index.html` と `estimate-form.js` が使うクラス名
  - `p-estimate` `p-estimate__inner` `p-estimate__label` `p-estimate__title` `p-estimate__lead` `p-estimate__noscript`
  - `p-estimate__body` `p-estimate__form` `p-estimate__group` `p-estimate__legend` `p-estimate__hint`
  - `p-estimate__choices` `p-estimate__choices--column` `p-estimate__choice` `p-estimate__number`
  - `p-estimate__result` `p-estimate__result-title` `p-estimate__items` `p-estimate__item` `p-estimate__item-price`
  - `p-estimate__totals` `p-estimate__total` `p-estimate__total--main` `p-estimate__cta`
  - `p-estimate__notes` `p-estimate__notes-title` `p-estimate__notes-list`
- Produces: なし

- [ ] **Step 1: SCSS を書く**

`assets/scss/page/estimate/_estimate.scss` を作る。

```scss
@use "../../foundation" as f;

/*!
page > estimate
------------------------------
*/
.p-estimate {
  background-color: var(--color-bg-base);
}

.p-estimate__inner {
  padding-block: 7rem var(--space-xl);
  max-width: var(--content-width-lg);
  margin-inline: auto;

  @include f.mq() {
    padding-block: 9rem var(--space-xl);
  }
}

.p-estimate__label {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  font-weight: var(--fw-medium);
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.p-estimate__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h2);
  line-height: var(--lh-tight);
  margin: 0.5rem 0 0.75rem;
}

.p-estimate__lead {
  line-height: var(--lh-base);
  color: var(--color-text-muted);
  margin-bottom: 2.5rem;
  max-width: 52ch;
}

.p-estimate__noscript {
  margin-bottom: var(--space-md);
  line-height: var(--lh-base);
}

.p-estimate__body {
  display: grid;
  gap: var(--space-md);

  @include f.mq(lg) {
    grid-template-columns: minmax(0, 1fr) 22.5rem;
    align-items: start;
    gap: var(--space-lg);
  }
}

.p-estimate__form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.p-estimate__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;

  // display を指定すると hidden 属性が効かなくなるため明示する
  &[hidden] {
    display: none;
  }
}

.p-estimate__legend {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  line-height: var(--lh-tight);
  margin-bottom: 0.25rem;
}

.p-estimate__hint {
  font-size: var(--fs-small);
  line-height: var(--lh-base);
  color: var(--color-text-muted);
}

.p-estimate__choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.p-estimate__choices--column {
  flex-direction: column;
}

.p-estimate__choice {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-surface);
  line-height: 1.5;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  input {
    flex-shrink: 0;
    width: 1.1rem;
    height: 1.1rem;
    accent-color: var(--color-accent);
  }

  &:has(input:checked) {
    border-color: var(--color-accent);
  }

  &:has(input:focus-visible) {
    box-shadow: 0 0 0 3px rgba(47, 74, 58, 0.12);
  }
}

.p-estimate__number {
  max-width: 8rem;
}

.p-estimate__result {
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-surface);

  @include f.mq(lg) {
    position: sticky;
    top: 6rem;
  }
}

.p-estimate__result-title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  line-height: var(--lh-tight);
}

.p-estimate__items {
  margin-top: 1rem;
}

.p-estimate__item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.6rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.p-estimate__item-price {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.p-estimate__totals {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.p-estimate__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;

  dt {
    font-size: var(--fs-small);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  dd {
    font-family: var(--font-display);
    font-weight: var(--fw-medium);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
}

.p-estimate__total--main dd {
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  line-height: var(--lh-tight);
  color: var(--color-accent);
}

.p-estimate__cta {
  width: 100%;
  margin-top: 1.5rem;
}

.p-estimate__notes {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.p-estimate__notes-title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  line-height: var(--lh-tight);
}

.p-estimate__notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: var(--fs-small);
  line-height: var(--lh-base);
  color: var(--color-text-muted);

  li {
    padding-left: 1em;
    text-indent: -1em;

    &::before {
      content: "・";
    }
  }
}
```

- [ ] **Step 2: 登録する**

`assets/scss/page/_index.scss` の `@use "contact/contact";` の次の行に1行足す。

```scss
@use "top/top-kv";
@use "top/top-about";
@use "top/top-skill";
@use "top/top-work";
@use "top/top-flow";
@use "top/top-contact";
@use "privacy/privacy";
@use "contact/contact";
@use "estimate/estimate";
@use "detail";
```

- [ ] **Step 3: ビルドする**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 何も出力されず終了コード 0。

Run: `grep -c 'p-estimate__result' assets/css/style.css`
Expected: `1` 以上。

Run: `npx stylelint assets/scss/page/estimate/_estimate.scss`
Expected: エラー0件。設定ファイルが無いというエラー（`No configuration provided`）が出た場合は、このリポジトリでは stylelint を使っていないので飛ばしてよい。

- [ ] **Step 4: 見た目をブラウザで確かめる**

```bash
python3 -m http.server 8080
```

`http://localhost:8080/estimate/index.html` を開き、開発者ツールで幅を変えて確かめる。

| 幅 | 確かめること |
|---|---|
| 375px | 横スクロールが出ない。選択肢・数量欄・結果の箱が1列に並ぶ。金額が箱からはみ出さない |
| 768px | ヘッダーのナビが横並びで、ロゴと重なったり折り返したりしない |
| 1280px | 左に入力、右に結果の2列。下へスクロールしても結果の箱が画面上部に付いてくる |
| 1280px・LP 11セクション | 「70,000〜80,000円」のような幅の金額が、結果の箱の中で折り返さず収まる |

あわせて次も確かめる。

- Tab キーだけで、種類 → 数量欄 → オプション → 「この内容で相談する」の順に移動でき、選択肢にフォーカスの輪が見える
- 「LP（1ページ）」を選ぶと「ページ数」の欄が消える（`hidden` が効いている）
- `http://localhost:8080/contact/index.html` と `http://localhost:8080/index.html` の見た目が変わっていない

確かめ終わったらサーバーを止める。

- [ ] **Step 5: コミット**

```bash
git add assets/scss/page/estimate/_estimate.scss assets/scss/page/_index.scss assets/css/style.css
git status --short
git commit -m "料金シミュレーターのスタイルを追加"
```

---

### Task 5: ナビへの追加と仕上げの確認

**Files:**
- Modify: `index.html`（ヘッダーのナビ、162〜170行目付近）
- Modify: `privacy/index.html` `contact/index.html`（ナビに1行）
- Modify: `contact/thanks/index.html` と `works/` 配下の10ページ（ナビに1行）
  - `works/coffee/index.html` `works/devco/index.html` `works/frontsign/index.html` `works/hair-salon/index.html` `works/handmade-ec/index.html` `works/handmade-lp/index.html` `works/photographer/index.html` `works/sumika/index.html` `works/towa-wp/index.html` `works/towa/index.html`
- Modify: `~/.claude/data/rate-card.md`（リポジトリの外。単価マスタ）

**Interfaces:**
- Consumes: Task 3 の `estimate/index.html`（リンク先）
- Produces: なし

- [ ] **Step 1: トップページのナビに足す**

`index.html` の次の部分を探す。

```html
                            <li>
                                <a href="#flow" class="l-header__link">Flow</a>
                            </li>
                            <li>
                                <a
                                    href="#contact"
                                    class="l-header__link l-header__link--cta"
                                    >Contact</a
                                >
                            </li>
```

Flow と Contact の間に Price を足して、次のようにする。

```html
                            <li>
                                <a href="#flow" class="l-header__link">Flow</a>
                            </li>
                            <li>
                                <a
                                    href="estimate/index.html"
                                    class="l-header__link"
                                    >Price</a
                                >
                            </li>
                            <li>
                                <a
                                    href="#contact"
                                    class="l-header__link l-header__link--cta"
                                    >Contact</a
                                >
                            </li>
```

- [ ] **Step 2: 1階層下のページに足す**

```bash
perl -0pi -e 's|(\n([ \t]*)<li><a href="[^"]*" class="l-header__link l-header__link--cta">)|\n$2<li><a href="../estimate/index.html" class="l-header__link">Price</a></li>$1|' privacy/index.html contact/index.html
```

- [ ] **Step 3: 2階層下のページに足す**

```bash
perl -0pi -e 's|(\n([ \t]*)<li><a href="[^"]*" class="l-header__link l-header__link--cta">)|\n$2<li><a href="../../estimate/index.html" class="l-header__link">Price</a></li>$1|' contact/thanks/index.html works/*/index.html
```

- [ ] **Step 4: 足した結果を確かめる**

Run: `grep -c 'estimate/index.html' index.html privacy/index.html contact/index.html contact/thanks/index.html works/*/index.html`
Expected: 14 ファイルすべてが `:1`。`:0` や `:2` のファイルがあれば、そのファイルを開いて手で直す。

Run: `git diff --stat`
Expected: 14 ファイル、各 1 行追加（`index.html` だけ 7 行追加）。削除行は 0。

Run: `git diff contact/index.html`
Expected: ナビの `<li>…Price…</li>` 1行の追加だけ。`<form` 以降に差分が無い。

- [ ] **Step 5: 全体をブラウザで確かめる**

```bash
python3 -m http.server 8080
```

| 確かめること | 期待 |
|---|---|
| `http://localhost:8080/index.html` のナビの Price を押す | シミュレーターが開く |
| `privacy/`、`contact/`、`contact/thanks/`、`works/towa/` のナビの Price を押す | どれもシミュレーターが開く（404 にならない） |
| 幅 375px でハンバーガーメニューを開く | Price が Flow と Contact の間に出ている |
| 幅 768px・1024px のトップページ | ナビ6項目がロゴと重ならず1行に収まる |
| シミュレーターで下層 3・スライダー 2 にして「この内容で相談する」→ 問い合わせページでブラウザの「戻る」 | シミュレーターの入力欄が下層 3・スライダー 2 のままで、表示も税抜 70,000円になっている |
| もう一度「この内容で相談する」→ 問い合わせ欄に文章が入る → 欄に手で文字を足す → 再読み込み | 再読み込み後に結果の文章が二重に入らない |
| 問い合わせページを直接開く（シミュレーターを経由しない） | お問い合わせ内容の欄は空 |
| 開発者ツールで JavaScript を無効にしてシミュレーターを開く | 単価表（4行）と注意書きが出る |

確かめ終わったらサーバーを止める。JavaScript の無効化を元に戻す。

- [ ] **Step 6: テストと lint を最後にもう一度通す**

Run: `node --test tests/estimate-calc.test.mjs && node --test tests/estimate-handoff.test.mjs`
Expected: どちらも `# fail 0`。

Run: `npx eslint assets/js`
Expected: 何も出力されない。

- [ ] **Step 7: コミット**

```bash
git add index.html privacy/index.html contact/index.html contact/thanks/index.html works
git status --short
git commit -m "ヘッダーのナビに料金シミュレーターへのリンクを追加"
```

- [ ] **Step 8: 単価マスタに記入する**

`~/.claude/data/rate-card.md` の明細表のうち、次の3行を置き換える。

置き換え前:

```markdown
| スライダー実装（Splide.js） | 箇所 | | |
| スクロール演出（GSAP） | 箇所 | | |
```

置き換え後:

```markdown
| スライダー実装（Splide.js） | 箇所 | 5,000円 | 2026-10-04 決定。想定2.5h。自動再生・矢印・ドットの標準的な構成 |
| スクロール演出（GSAP） | ページ | 10,000円 | 2026-10-04 決定。表示演出をページ全体に入れる一式。2ページ目以降は別途 |
```

置き換え前:

```markdown
| デプロイ（Vercel/Netlify/サーバー） | 式 | | |
```

置き換え後:

```markdown
| デプロイ（Vercel/Netlify/サーバー） | 式 | 5,000円 | 2026-10-05 決定。用意されたサーバーへのアップロードと表示確認まで。サーバー・ドメインの契約や設定、SSL、DNS切り替えは別途。相場: 代行会社で 0〜15,000円 |
```

このファイルは portfolio2 のリポジトリの外にあるので、ここではコミットしない。記入したことを完了報告に書く。

---

## 計画に含めないこと

- `netlify` ブランチへのマージ、`main` へのマージ、push、FTP アップロード（ユーザーが行う）
- FTP アップロード時、`tests/` と `docs/` は本番に上げる必要がない
- OGP 画像の作り分け（既存の共通画像を使う）
- フッターのナビへの追加（仕様はヘッダーだけ）
