/**
 * ヘッダーの背景色変更（スクロール位置ベース）
 */
export const initializeHeaderBackgroundToggle = () => {
    const header = document.querySelector('.js-header');
    if (!header) return;

    const threshold = 64;

    const update = () => {
        header.classList.toggle('is-active', window.scrollY > threshold);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
};
