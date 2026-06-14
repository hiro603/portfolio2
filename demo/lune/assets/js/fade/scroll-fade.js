export const initializeScrollFade = () => {
    const scrollLine = document.querySelectorAll('.js-scroll-line');
    const scrollText = document.querySelectorAll('.js-scroll-text');

    if (!scrollLine.length || !scrollText.length) return;

    gsap.set(scrollLine, {
        scaleY: 0,
      });
      
      gsap.set(scrollText, {
        opacity: 0,
        y: 8,
      });
      
      gsap.timeline()
        .to(scrollLine, {
          scaleY: 1,
          duration: 0.8,
          ease: "power2.out",
        })
        .to(scrollText, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        }, "-=0.2");
}