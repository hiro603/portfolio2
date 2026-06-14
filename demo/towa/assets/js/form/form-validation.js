export const initializeFormValidation = () => {
    const form = document.getElementById('contact-form');
const name    = document.getElementById('name');
const email   = document.getElementById('email');
const message = document.getElementById('message');
const agree   = document.getElementById('agree');

// blurバリデーション
name.addEventListener('blur', () => {
  clearError(name);
  if (name.value.trim() === '') showError(name, 'お名前を入力してください');
});

email.addEventListener('blur', () => {
  clearError(email);
  if (email.value.trim() === '') {
    showError(email, 'メールアドレスを入力してください');
  } else if (!isValidEmail(email.value)) {
    showError(email, '正しいメールアドレスを入力してください');
  }
});

message.addEventListener('blur', () => {
  clearError(message);
  if (message.value.trim() === '') showError(message, 'お問い合わせ内容を入力してください');
});

agree.addEventListener('change', () => {
  clearError(agree);
  if (!agree.checked) showError(agree, 'プライバシーポリシーへの同意が必要です');
});

// 送信時バリデーション
form.addEventListener('submit', (e) => {
  [name, email, message].forEach(input => input.dispatchEvent(new Event('blur')));
  agree.dispatchEvent(new Event('change'));

  if (document.querySelectorAll('.error-message').length > 0) {
    e.preventDefault(); // エラーがあれば送信を止める
  }
  // エラーがなければそのままNetlifyに送信される
});

// ユーティリティ
function showError(input, msg) {
  const error = document.createElement('span');
  error.className = 'error-message';
  error.textContent = msg;
  input.classList.add('is-error');
  input.parentNode.appendChild(error);
}

function clearError(input) {
  input.classList.remove('is-error');
  const error = input.parentNode.querySelector('.error-message');
  if (error) error.remove();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
}

// initializeFormValidation();