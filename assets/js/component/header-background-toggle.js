/**
 * ヘッダーの背景色変更（スクロールで is-active を付与、見た目はCSS側で制御）
 */
export const initializeHeaderBackgroundToggle = () => {
    const headerElement = document.querySelector('.js-header');
    const triggerElement = document.querySelector('.js-header-trigger');
    const headerActiveClass = 'is-active';

    if (!headerElement || !triggerElement) return;

    ScrollTrigger.create({
        trigger: triggerElement,
        start: 'bottom top',
        onEnter: () => headerElement.classList.add(headerActiveClass),
        onLeaveBack: () => headerElement.classList.remove(headerActiveClass),
    });
};
