/**
 * 画像ギャラリースライダー
 */
export const initializeStrengthSlider = () => {
    const strengthSlider = document.querySelector('.js-strength-slider');

    if (!strengthSlider) return;

    const splide = new Splide(strengthSlider, {
        type: 'loop',
        perPage: 4,
        perMove: 1,
        gap: '40px',
        arrows: false,
        pagination: false,
        autoplay: true,
        interval: 3000,
        padding: { left: "0", right: "10%" },
        breakpoints: {
            1200: {
                perPage: 3,
                padding: { left: "50px", right: "50px" },
                gap: "24px",
            },
            899: {
                perPage: 1.2,
                padding: { left: "0", right: "20px" },
                gap: "16px",
            },
        },
    });
    splide.mount();
};
