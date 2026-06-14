export const initializeQualityFade = () => {
    const elements = document.querySelectorAll('.js-top-quality');
    if (!elements.length) return;

    const keyframes = {
        opacity: [0, 1],
        transform: ['translateY(200px)', 'translateY(0)'],
    };

    const animationOptions = {
        duration: 1600,
        fill: 'forwards',
    };

    const observer = new IntersectionObserver(
        (entries, obs) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.animate(keyframes, animationOptions);
                obs.unobserve(entry.target);
            }
        },
        { root: null, rootMargin: '0px', threshold: 0.15 }
    );

    elements.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(200px)';
        observer.observe(el);
    });
}