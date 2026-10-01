export const initializeJobTabs = () => {
  const tabs = document.querySelectorAll(".js-job-tab");
  const panels = document.querySelectorAll(".js-job-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const index = tab.dataset.job;

      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      panels.forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.job !== index);
      });
    });
  });
};
