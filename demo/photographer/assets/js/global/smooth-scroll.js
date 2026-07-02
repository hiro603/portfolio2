import Lenis from "../vendor/lenis.js";
export const initializeSmoothScroll = (options = {}) => {
  const lenis = new Lenis({
    duration: 1.1, // 慣性の長さ。大きいほどヌルッと粘る
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expoOut
    ...options, // 呼び出し側で duration/easing 等を上書き（後勝ち）
  });

  // ★ここ：LenisがスクロールするたびScrollTriggerを更新＝両者を同期
  if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update); // ②ガード

  // Lenisを毎フレーム回す（これがスクロールの心臓）
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // ページ内アンカー（#works等）もLenisで滑らかに飛ばす
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
    });
  });
  return lenis;
};
