import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { createWebGLStage } from "./global/webgl-stage.js";
import { worksEffect } from "./works/works-webgl.js";
import { heroEffect } from "./hero/hero-webgl.js";
import { initializeSmoothScroll } from "./global/smooth-scroll.js";
import { initializeMailform } from "./form/mailform.js";
import { initializeCustomCursor } from "./global/custom-cursor.js";
import { initializePreloader } from "./global/preloader.js";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const preloader = initializePreloader();

try {
  const stage = createWebGLStage({
    onProgress: (p) => preloader.set(p), // 0〜1
    onLoad: () => preloader.done(), // 全テクスチャ完了
  });
  stage.add(worksEffect({ reduceMotion }));
  stage.add(heroEffect({ reduceMotion }));
  stage.start();
} catch {
  preloader.done(); // WebGL 不可でも装飾を諦めて先へ（フォーム等の必須処理を止めない）
}

initializeHamburgerMenu();

if (!reduceMotion) initializeSmoothScroll(); // 慣性スクロールは切ってネイティブに戻す
initializeMailform();
initializeCustomCursor({ reduceMotion });
