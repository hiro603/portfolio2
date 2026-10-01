export function initializeHeroIntro() {
  const items = document.querySelectorAll(".js-hero-item");
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  gsap.from(items, {
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: "power2.out",
    stagger: 0.06,
  });
}
