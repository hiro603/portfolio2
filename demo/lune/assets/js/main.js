import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { initializeHeaderBackgroundToggle } from "./component/header-background-toggle.js";
import { initializeCultureGallery } from "./slider/gallery-slider.js";
import { initializeAboutStaffSlider } from "./slider/staff-slider.js";
import { initializeScrollFade } from "./fade/scroll-fade.js";
// import { initializeFormValidation } from "./form/form-validation.js";

gsap.registerPlugin(ScrollTrigger);

initializeHamburgerMenu();
initializeHeaderBackgroundToggle();
initializeCultureGallery();
initializeAboutStaffSlider();
initializeScrollFade();
// initializeFormValidation();