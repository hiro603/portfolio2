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
