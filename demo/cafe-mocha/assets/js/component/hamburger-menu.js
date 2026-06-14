/**
 * ハンバーガーメニュー
 */
export const initializeHamburgerMenu = () => {
    const menu = document.querySelector('.js-header-menu');
    const closeButton = document.querySelector('.js-header-menu-close-button');
    const openButton = document.querySelector('.js-header-menu-open-button');

    if (!menu || !closeButton || !openButton) return;

    const openMenu = () => {
        document.body.style.overflow = 'hidden';
        menu.showModal();

        gsap.fromTo(
            menu,
            {
                x: '100%',
            },
            {
                x: 0,
                duration: 1.3,
                ease: 'power2.out',
            },
        );
    };

    const closeMenu = () => {
        gsap.to(
            menu,
            {
                x: '100%',
                duration: 1.3,
                ease: 'power2.out',
                onComplete: () => {
                    menu.close();
                    document.body.style.overflow = '';
                    gsap.set(menu, { clearProps: 'transform' });
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
        if (window.innerWidth >= 900) {
            menu.close();
            document.body.style.overflow = '';
            gsap.set(menu, { clearProps: 'transform' });
        }
    });
};
