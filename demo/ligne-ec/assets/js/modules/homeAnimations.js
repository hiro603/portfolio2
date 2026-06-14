function canAnimate() {
  return (
    typeof gsap !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function revealOnScroll(target, vars = {}) {
  gsap.from(target, {
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: 'power2.out',
    scrollTrigger: { trigger: target, start: 'top 85%' },
    ...vars,
  });
}

export function initHomeAnimations() {
  if (!document.querySelector('.p-hero') || !canAnimate()) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(
    ['.p-hero__sub', '.p-hero__title', '.p-hero__description', '.p-hero__btn'],
    { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out', stagger: 0.12 }
  );
  gsap.from('.p-hero__image-wrapper', {
    opacity: 0,
    duration: 0.8,
    delay: 0.3,
    ease: 'power2.out',
  });

  revealOnScroll('.p-concept__image-wrapper', { x: -32, y: 0 });
  revealOnScroll('.p-concept__content', { x: 32, y: 0 });
  revealOnScroll('.p-new-arrivals__header');
  revealOnScroll('.p-categories__header');
  gsap.from('.p-categories__item', {
    opacity: 0,
    y: 24,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.p-categories__list', start: 'top 85%' },
  });
  revealOnScroll('.p-banner__content');
  revealOnScroll('.p-banner__image-wrapper');
}

export function initArrivalsAnimation() {
  const list = document.querySelector('.js-new-arrivals-list');
  if (!list || !list.children.length || !canAnimate()) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.from(list.children, {
    opacity: 0,
    y: 24,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: list, start: 'top 85%' },
  });
}
