export const initializeFaq = () => {
  const items = document.querySelectorAll(".js-faq");
  if (!items.length) return;

  const close = (item) => {
    item.classList.remove("is-open");
    item.querySelector(".js-faq-sign").textContent = "+";

    const panel = item.querySelector(".js-faq-panel");
    panel.style.maxHeight = 0;
  };

  const open = (item) => {
    item.classList.add("is-open");
    item.querySelector(".js-faq-sign").textContent = "-";

    const panel = item.querySelector(".js-faq-panel");
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  };

  items.forEach((item) => {
    const head = item.querySelector(".js-faq-head");

    head.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach(close);
      if (!isOpen) open(item);
    });
  });
};
