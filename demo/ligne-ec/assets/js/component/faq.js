// component/faq.js
export function initFaq() {
    const btns = document.querySelectorAll('.js-faq-btn');
    if (!btns.length) return;
  
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isOpen);
        const answer = btn.nextElementSibling;
        answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
      });
    });
}