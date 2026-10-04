import { initializeEstimateForm } from "./component/estimate-form.js";
import { initializeEstimateHandoff } from "./component/estimate-handoff.js";
import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { initializeHeaderBackgroundToggle } from "./component/header-background-toggle.js";
import { initializeScrollReveal } from "./component/scroll-reveal.js";

// GSAP に依存しない処理は、GSAP の読み込みに失敗しても動くよう先に実行する
initializeEstimateHandoff();
initializeEstimateForm();

gsap.registerPlugin(ScrollTrigger);

initializeHamburgerMenu();
initializeHeaderBackgroundToggle();
initializeScrollReveal();
