/**
 * ライフスタイル写真の自動スクロール
 */
export const initializeLifestyleSlider = () => {
    const slider = document.querySelector('.js-lifestyle-slider');

    if (!slider || typeof Splide === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const instance = new Splide(slider, {
        type: 'loop',
        drag: 'free',
        perPage: 4,
        gap: '16px',
        arrows: false,
        pagination: false,
        autoScroll: {
            speed: 0.6,
            pauseOnHover: true,
            pauseOnFocus: true,
            autoStart: !reduce,
        },
        breakpoints: {
            1024: { perPage: 3 },
            768: { perPage: 2 },
        },
    });

    instance.mount(window.splide?.Extensions || {});
};
