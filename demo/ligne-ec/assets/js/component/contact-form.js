export function initContactForm() {
  const form = document.querySelector('.js-contact-form');
  if (!form) return;

  // バリデーションルール
  function validate(name, value) {
    if (!value.trim()) {
      return 'この項目は必須です';
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '正しいメールアドレスを入力してください';
    }
    return '';
  }

  // エラーを表示
  function showError(name, message) {
    const error = form.querySelector(`.js-error[data-for="${name}"]`);
    if (!error) return;
    error.textContent = message;
    error.classList.toggle('is-visible', !!message);
  }

  // 入力時にリアルタイムバリデーション
  form.querySelectorAll('.js-input').forEach(input => {
    input.addEventListener('blur', () => {
      const error = validate(input.name, input.value);
      showError(input.name, error);
    });
  });

  // 送信時
  form.addEventListener('submit', e => {
    e.preventDefault();

    let hasError = false;

    form.querySelectorAll('.js-input').forEach(input => {
      const error = validate(input.name, input.value);
      showError(input.name, error);
      if (error) hasError = true;
    });

    if (hasError) return;

    // 送信成功（ポートフォリオ用途のためアラートで代替）
    alert('お問い合わせを受け付けました。3営業日以内にご返信いたします。');
    form.reset();
    form.querySelectorAll('.js-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('is-visible');
    });
  });
}