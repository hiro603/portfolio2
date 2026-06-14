/**
 * 画像ギャラリースライダー
 */
export const initializeMenuSlider = () => {
    const menuSlider = document.querySelector('.js-top-menu-slider');

    if (!menuSlider) return;

    const splide = new Splide(menuSlider, {
        destroy: true,

        breakpoints: {
            767: {
                type: 'loop',
                perPage: 1,
                perMove: 1,
                padding: { left: "20px", right: "125px" },
                gap: "24px",
                arrows: false,
                pagination: false,
                autoplay: true,
                interval: 3000,
                destroy: false,
            },
        },
    });
    splide.mount();
};
