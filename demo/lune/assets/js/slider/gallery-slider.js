/**
 * 画像ギャラリースライダー
 */
export const initializeCultureGallery = () => {
    const worksSlider = document.querySelector('.js-works-slider');

    if (!worksSlider) return;

    const splide = new Splide(worksSlider, {
        type: 'loop',
        perPage: 3,
        perMove: 1,
        gap: '40rem',
        arrows: false,
        pagination: false,
        autoplay: true,
        interval: 3000,
        padding: { left: "172rem", right: "259rem" },
        breakpoints: {
            767: {
                perPage: 1,
                padding: { left: "20rem", right: "125rem" },
                gap: "32rem",
            },
        },
    });
    splide.mount();
};
