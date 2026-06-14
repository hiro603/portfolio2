export const initializeHamburgerMenu = () => {
    const hamburger = document.querySelector('.hamburger');
    const dialog = document.getElementById('menu-dialog');

    if (!hamburger || !dialog) return;

    const closeBtn = dialog.querySelector('.menu-dialog__close');

    hamburger.addEventListener('click', () => {
      dialog.showModal();
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });

    const closeMenu = () => {
      dialog.close();
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeMenu);
    dialog.querySelectorAll('.menu-dialog__nav a').forEach(a => a.addEventListener('click', closeMenu));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeMenu(); });
};
