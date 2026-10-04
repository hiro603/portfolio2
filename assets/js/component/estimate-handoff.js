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
