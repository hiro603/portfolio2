const getRecaptchaToken = (siteKey) =>
  new Promise((resolve) => {
    if (!siteKey || typeof grecaptcha === "undefined") {
      resolve("");
      return;
    }
    grecaptcha.ready(() => {
      grecaptcha
        .execute(siteKey, { action: "submit" })
        .then(resolve, () => resolve(""));
    });
  });

const setHiddenToken = (form, token) => {
  let input = form.querySelector('input[name="g-recaptcha-response"]');
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = "g-recaptcha-response";
    form.appendChild(input);
  }
  input.value = token;
};

const labelFor = (form, input) => {
  const byFor = input.id && form.querySelector(`label[for="${input.id}"]`);
  const text = (byFor ?? input.closest("label"))?.textContent ?? input.name;
  return text.replace(/\s+/g, " ").replace(/\s*(required|必須|\*)\s*$/i, "").trim();
};

const messageFor = (form, input) => {
  const v = input.validity;
  if (v.valid) return "";
  if (input.dataset.error) return input.dataset.error;
  const label = labelFor(form, input);
  if (v.valueMissing) {
    return input.type === "checkbox"
      ? `${label}に同意してください`
      : `${label}を入力してください`;
  }
  if (v.typeMismatch || v.patternMismatch) return `${label}の形式が正しくありません`;
  if (v.tooLong) return `${label}は${input.maxLength}文字以内で入力してください`;
  if (v.tooShort) return `${label}は${input.minLength}文字以上で入力してください`;
  return `${label}を確認してください`;
};

export const initializeMailform = () => {
  const form = document.querySelector(".js-mailform");
  if (!form) return;

  const siteKey = form.dataset.recaptchaSiteKey ?? "";
  const useAjax = form.dataset.ajax === "true";
  const honeypotName = form.dataset.honeypot || "company";
  const honeypot = form.querySelector(`[name="${honeypotName}"]`);
  const successBanner = form.querySelector(".js-mailform-success");
  const alertBanner = form.querySelector(".js-mailform-alert");
  const submitButton = form.querySelector('[type="submit"]');

  const controls = [...form.elements].filter(
    (el) =>
      el.name &&
      el.name !== honeypotName &&
      el.name !== "g-recaptcha-response" &&
      !el.disabled &&
      !["submit", "button", "hidden"].includes(el.type),
  );

  const wrapperOf = (input) =>
    input.closest(".js-mailform-field") ?? input.parentNode;

  const clearError = (input) => {
    input.classList.remove("is-error");
    wrapperOf(input).querySelector(".js-mailform-error")?.remove();
  };

  const showError = (input, msg) => {
    clearError(input);
    input.classList.add("is-error");
    const span = document.createElement("span");
    span.className = "c-form__error js-mailform-error";
    span.textContent = msg;
    wrapperOf(input).appendChild(span);
  };

  const validateField = (input) => {
    const msg = messageFor(form, input);
    if (msg) showError(input, msg);
    else clearError(input);
    return !msg;
  };

  controls.forEach((input) => {
    const evt =
      input.type === "checkbox" ||
      input.type === "radio" ||
      input.tagName === "SELECT"
        ? "change"
        : "blur";
    input.addEventListener(evt, () => validateField(input));
  });

  const showAlert = (text) => {
    if (!alertBanner) return;
    alertBanner.textContent = text;
    alertBanner.classList.add("is-visible");
  };

  let sending = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;

    if (honeypot && honeypot.value !== "") return;

    const ok = controls.map(validateField).every(Boolean);
    if (!ok) {
      form.querySelector(".is-error")?.focus();
      return;
    }

    sending = true;
    if (submitButton) submitButton.disabled = true;
    successBanner?.classList.remove("is-visible");
    alertBanner?.classList.remove("is-visible");

    const token = await getRecaptchaToken(siteKey);
    if (token) setHiddenToken(form, token);

    if (!useAjax) {
      form.submit();
      return;
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await response.json();
      if (data.ok) {
        form.reset();
        successBanner?.classList.add("is-visible");
      } else {
        showAlert((data.errors ?? ["送信に失敗しました。"]).join(" "));
      }
    } catch {
      showAlert("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      sending = false;
      if (submitButton) submitButton.disabled = false;
    }
  });
};
