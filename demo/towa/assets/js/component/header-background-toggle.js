/**
 * ヘッダーの背景色変更
 */
export const initializeHeaderBackgroundToggle = () => {
    const TriggerElement = document.querySelector('.js-header-trigger');
    const headerElement = document.querySelector('.js-header');
    const headerActiveClass = 'is-active';

    if (!TriggerElement || !headerElement) return;

    const setWhiteBackground = () => {
        headerElement.classList.add(headerActiveClass);
        gsap.to(headerElement, {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 7px 30px 0 rgba(100, 100, 111, 0.1)',
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    const setTransparentBackground = () => {
        headerElement.classList.remove(headerActiveClass);
        gsap.to(headerElement, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            boxShadow: '0 7px 30px 0 rgba(100, 100, 111, 0)',
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    ScrollTrigger.create({
        trigger: TriggerElement,
        start: 'bottom top',
        onEnter: () => setWhiteBackground(),
        onLeaveBack: () => setTransparentBackground(),
    });
};
