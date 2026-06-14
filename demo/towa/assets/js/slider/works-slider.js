/**
 * スタッフスライダー
 */
export const initializeWorksSlider = () => {
    const worksSlider = document.querySelector('.js-works-slider');

    if (!worksSlider) return;

    const splide = new Splide(worksSlider, {
        type: 'loop',
        perPage: 3,
        perMove: 1,
        gap: '40px',
        arrows: false,
        pagination: false,
        autoplay: true,
        interval: 3000,
        padding: { left: "172px", right: "259px" },
        breakpoints: {
            767: {
                perPage: 1,
                padding: { left: "20px", right: "125px" },
                gap: "32px",
            },
        },
    });
    splide.mount();
};
