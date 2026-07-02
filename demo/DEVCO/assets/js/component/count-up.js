export function initializeCountUp() {
  const valueElements = document.querySelectorAll(".js-stat-value");
  if (!valueElements.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  valueElements.forEach((element) => {
    const numberNode = element.firstChild;
    if (!numberNode || numberNode.nodeType !== Node.TEXT_NODE) return;

    const rawText = numberNode.textContent.trim();
    const target = parseFloat(rawText.replaceAll(",", ""));
    if (Number.isNaN(target)) return;

    const decimals = (rawText.split(".")[1] || "").length;
    const counter = { value: 0 };
    numberNode.textContent = "0";

    ScrollTrigger.create({
      trigger: element,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          value: target,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            numberNode.textContent = counter.value.toFixed(decimals);
          },
        });
      },
    });
  });
}
