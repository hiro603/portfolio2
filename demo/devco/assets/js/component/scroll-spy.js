export function initializeScrollSpy() {
  const links = document.querySelectorAll(".js-nav-link");
  if (!links.length) return;

  links.forEach((link) => {
    const id = link.getAttribute("href");
    if (!id || !id.startsWith("#")) return;

    const section = document.querySelector(id);
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => link.classList.toggle("is-current", self.isActive),
    });
  });
}
