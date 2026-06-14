import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { initializeHeaderBackgroundToggle } from "./component/header-background-toggle.js";
import { initializeStrengthSlider } from "./slider/strength-slider.js";
import { initializeWorksSlider } from "./slider/works-slider.js";
import { initializeStrengthFade } from "./fade/strength-fade.js";
import { initializeQualityFade } from "./fade/quality-fade.js";
import { initializeFormValidation } from "./form/form-validation.js";

// 全ての初期化を実行
initializeHamburgerMenu();
initializeHeaderBackgroundToggle();
initializeStrengthSlider();
initializeWorksSlider();
initializeStrengthFade();
initializeQualityFade();
initializeFormValidation();
