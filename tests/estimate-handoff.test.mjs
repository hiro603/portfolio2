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
