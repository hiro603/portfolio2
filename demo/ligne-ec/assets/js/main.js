import { initHamburgerMenu } from "./component/hamburger-menu.js";
import { initCart } from "./modules/cart.js";
import { initProductDetailPage } from "./modules/productDetail.js";
import { initHomePage } from "./modules/homePage.js";
import { initHomeAnimations, initArrivalsAnimation } from "./modules/homeAnimations.js";
import { initFaq } from "./component/faq.js";
import { initContactForm } from "./component/contact-form.js";
import { initRegisterForm } from "./component/registerForm.js";
import { initShopPage } from "./modules/shopPage.js";

// 全ての初期化を実行
initHamburgerMenu();
initCart();
initProductDetailPage();
initHomeAnimations();
initHomePage().then(initArrivalsAnimation);
initFaq();
initContactForm();
initRegisterForm();
initShopPage();