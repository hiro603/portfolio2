import { initializeEstimateForm } from "./component/estimate-form.js";
import { initializeEstimateHandoff } from "./component/estimate-handoff.js";
import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { initializeHeaderBackgroundToggle } from "./component/header-background-toggle.js";
import { initializeScrollReveal } from "./component/scroll-reveal.js";

gsap.registerPlugin(ScrollTrigger);

initializeHamburgerMenu();
initializeHeaderBackgroundToggle();
initializeScrollReveal();
initializeEstimateHandoff();
initializeEstimateForm();
