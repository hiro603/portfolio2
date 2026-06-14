/**
 * ハンバーガーメニュー
 */
export const initializeHamburgerMenu = () => {
    const menu = document.querySelector('.js-header-menu');
    const closeBtn = document.querySelector('.js-header-menu-close');
    const openBtn = document.querySelector('.js-header-menu-open');

    const menuItems = document.querySelectorAll(".js-header-menu-nav-item");

    if (!menu || !openBtn || !closeBtn) return;

    const line1 = document.querySelectorAll(".js-hamburger-line")[0];
    const line2 = document.querySelectorAll(".js-hamburger-line")[1];
    const menuBg = document.querySelector(".js-header-menu-bg");

    let isOpen = false;

const openMenu = () => {
  menu.showModal();
  gsap.set(menu, {
    opacity: 1,
    visibility: "visible",
  });

  const tl = gsap.timeline();
  tl.to(line1, {
    y: 4,
    rotate: 35,
    duration: 0.3,
    ease: "power2.out",
  })

  .to(line2, {
    y: -5,
    rotate: -35,
    duration: 0.3,
    ease: "power2.out",
  }, "<")

  .fromTo(menuBg, {
    opacity: 0,
    scale: 1.08,
  }, {
    opacity: 0.5,
    scale: 1,
    duration: 1,
    ease: "power3.out",
  }, "-=0.1")

  .fromTo(menuItems, {
    y: 24,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    stagger: 0.08,
    duration: 0.7,
    ease: "power3.out",
  }, "-=0.7");

  isOpen = true;
};

const closeMenu = () => {
  const tl = gsap.timeline({
    onComplete: () => {
      menu.close();
      gsap.set(menu, {
        opacity: 0,
        visibility: "hidden",
      });
    }
  });

  tl.to(menuItems, {
    y: -16,
    opacity: 0,
    stagger: 0.05,
    duration: 0.4,
    ease: "power2.in",
  })

  .to(menuBg, {
    opacity: 0,
    scale: 1.05,
    duration: 0.5,
    ease: "power2.out",
  }, "-=0.3")

  .to(line1, {
    y: 0,
    rotate: 0,
    duration: 0.3,
    ease: "power2.out",
  }, "-=0.2")

  .to(line2, {
    y: 0,
    rotate: 0,
    duration: 0.3,
    ease: "power2.out",
  }, "<");
  isOpen = false;
};

openBtn.addEventListener("click", () => {
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});
closeBtn.addEventListener("click", closeMenu);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 900) {
      menu.close();
      document.body.style.overflow = "";
  }
});
};


