export const initializeAccordionMenu = () => {
    const trigger = document.querySelector('.js-accordion-trigger');
    const content = document.querySelector('.js-accordion-list');

    if (!trigger || !content) return;

    gsap.set(content, { height: 0, opacity: 0 });

trigger.addEventListener('click', () => {
    const isOpen = content.classList.toggle('is-open');

    if (isOpen) {
        gsap.timeline()
            .to(content, {
                height: "auto",
                duration: 0.35,
                ease: "power2.out"
            })
            .to(content, {
                opacity: 1,
                duration: 0.2
            }, "-=0.2");
    } else {
        gsap.timeline()
            .to(content, {
                opacity: 0,
                duration: 0.2
            })
            .to(content, {
                height: 0,
                duration: 0.3,
                ease: "power2.in"
            }, "-=0.1");
    }
});
};