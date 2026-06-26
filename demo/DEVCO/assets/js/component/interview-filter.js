export const initializeInterviewFilter = () => {
  const tabs = document.querySelectorAll(".js-interview-tab");
  const cards = document.querySelectorAll(".js-interview-card");
  if (!tabs.length || !cards.length) return;

  const apply = (filter) => {
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.cat === filter;
      card.classList.toggle("is-hidden", !match);
      card.classList.toggle("is-match", filter !== "all" && match);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      apply(tab.dataset.filter);
    });
  });

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
    });
  });
};
