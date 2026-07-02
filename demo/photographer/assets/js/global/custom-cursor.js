export const initializeCustomCursor = ({
  reduceMotion = false,
  hoverTargets = "a, button, .js-cursor-hover",
} = {}) => {
  // タッチ端末では出さない
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const ring = document.createElement("div");
  ring.className = "c-cursor";
  const dot = document.createElement("div");
  dot.className = "c-cursor__dot";
  document.body.append(ring, dot);
  document.documentElement.classList.add("has-cursor"); // ネイティブカーソルを隠す合図

  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const pos = { ...target };
  const ease = reduceMotion ? 1 : 0.15; // reduce時は遅延なし

  window.addEventListener("mousemove", (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; // ドットは即時
  });

  // リンク・Works上でリング拡大
  document.querySelectorAll(hoverTargets).forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
  });

  const render = () => {
    pos.x += (target.x - pos.x) * ease; // リングは粘って追従
    pos.y += (target.y - pos.y) * ease;
    ring.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    requestAnimationFrame(render);
  };
  render();
};
