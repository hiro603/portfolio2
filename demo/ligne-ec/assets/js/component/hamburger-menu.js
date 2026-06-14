export const initHamburgerMenu = () => {
    const headerMenuButton = document.querySelector('.js-header-menu-button');
    const headerMenu = document.querySelector('.js-header-menu');

    if (!headerMenuButton || !headerMenu) return;

    headerMenuButton.addEventListener('click', () => {
        const isOpen = headerMenu.classList.toggle('is-open');
        headerMenuButton.classList.toggle('is-active', isOpen);

        headerMenuButton.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
};
