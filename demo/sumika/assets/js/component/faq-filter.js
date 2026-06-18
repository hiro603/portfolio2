export const initializeFaqFilter = () => {
    const categoryLinks = document.querySelectorAll('[data-faq-filter]');
    if (!categoryLinks.length) return;

    const items = document.querySelectorAll('[data-faq-category]');
    const resultEl = document.querySelector('.p-faq-result');
    const searchInput = document.querySelector('#faq-keyword');

    let currentCategory = 'all';
    let currentKeyword = '';

    const itemTexts = Array.from(items).map(item => item.textContent);

    const applyFilter = () => {
        let visible = 0;
        items.forEach((item, i) => {
            const matchCategory = currentCategory === 'all' || item.dataset.faqCategory === currentCategory;
            const matchKeyword = !currentKeyword || itemTexts[i].includes(currentKeyword);
            const show = matchCategory && matchKeyword;
            if (!show && item.open) item.open = false;
            item.hidden = !show;
            if (show) visible++;
        });
        if (resultEl) resultEl.textContent = `${visible}件の質問があります`;
    };

    categoryLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            currentCategory = link.dataset.faqFilter;

            categoryLinks.forEach(l => {
                const active = l === link;
                l.classList.toggle('is-current', active);
                if (active) {
                    l.setAttribute('aria-current', 'true');
                } else {
                    l.removeAttribute('aria-current');
                }
            });

            applyFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentKeyword = searchInput.value.trim();
            applyFilter();
        });

        searchInput.closest('form')?.addEventListener('submit', e => e.preventDefault());
    }

    applyFilter();
};
