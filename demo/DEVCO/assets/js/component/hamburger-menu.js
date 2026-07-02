/**
 * ハンバーガーメニュー
 */
export const initializeHamburgerMenu = () => {
    const menu = document.querySelector('.js-menu');
    const closeButton = document.querySelector('.js-menu-close');
    const openButton = document.querySelector('.js-menu-open');

    if (!menu || !closeButton || !openButton) return;

    const openMenu = () => {
        document.body.style.overflow = 'hidden';
        menu.showModal();

        gsap.fromTo(
            menu,
            {
                opacity: 0,
            },
            {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
            },
        );
    };

    const closeMenu = () => {
        gsap.to(
            menu,
            {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    menu.close();
                    document.body.style.overflow = '';
                },
            },
        );
    };

    openButton.addEventListener('click', () => {
        openMenu();
    });

    closeButton.addEventListener('click', () => {
        closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            menu.close();
            document.body.style.overflow = '';
        }
    });
};
