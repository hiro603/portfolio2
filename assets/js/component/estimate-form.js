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
