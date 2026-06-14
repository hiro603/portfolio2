/**
 * スタッフスライダー
 */
export const initializeInfoSnsSlider = () => {
    const infoSnsSlider = document.querySelector('.js-info-sns-slider');

    if (!infoSnsSlider) return;

    const splide = new Splide(infoSnsSlider, {
        type: "loop",
        perPage: 4,
        perMove: 1,
        arrows: false,
        pagination: false,
        autoplay: true,
        interval: 3000,
        gap: "40px",
        padding: { left: "50px", right: "60px" },
        breakpoints: {
            899: {
                perPage: 1,
                padding: { left: "0", right: "20%" },
                gap: "32px",
            },
        },
    });
    splide.mount();
};
