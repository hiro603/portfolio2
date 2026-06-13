/**
 * スクロール連動フェードイン
 * .js-reveal を下からふわっと表示。reduced-motion 時は即表示。
 */
export const initializeScrollReveal = () => {
  const targets = document.querySelectorAll('.js-reveal');
  if (!targets.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || typeof gsap === 'undefined') {
    targets.forEach((el) => { el.style.opacity = '1'; });
    return;
  }

  targets.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      },
    );
  });
};
