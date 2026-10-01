export function initializeHeaderBackgroundToggle() {
  const headerElement = document.querySelector(".js-header");
  const triggerElement = document.querySelector(".js-header-trigger");
  const headerActiveClass = "is-active";

  if (!headerElement || !triggerElement) return;

  const activate = () => headerElement.classList.add(headerActiveClass);
  const deactivate = () => headerElement.classList.remove(headerActiveClass);

  ScrollTrigger.create({
    trigger: triggerElement,
    start: "top top",
    onEnter: activate,
    onLeaveBack: deactivate,
  });
}
