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

    if (Number.isNaN(number)) return min;

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
