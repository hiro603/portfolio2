export function initializeScrollReveal() {
  const targets = document.querySelectorAll(".js-reveal");
  if (!targets.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  gsap.set(targets, { opacity: 0, y: 28 });

  ScrollTrigger.batch(targets, {
    start: "top 88%",
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.06,
        overwrite: true,
      });
    },
  });
}
