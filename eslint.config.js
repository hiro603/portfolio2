import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["assets/js/vendor/**"] },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        gsap: "readonly",
        ScrollTrigger: "readonly",
      },
    },
  },
];
