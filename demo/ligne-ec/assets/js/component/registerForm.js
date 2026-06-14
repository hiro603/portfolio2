export function initRegisterForm() {
    const form = document.querySelector('.js-register-form');
    if (!form) return;
  
    // バリデーションルール
    function validate(name, value, otherValue = null) {
      if (!value.trim()) {
        return 'この項目は必須です';
      }
      if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return '正しいメールアドレスを入力してください';
      }
      if (name === 'password' && value.length < 8) {
        return '8文字以上で設定してください';
      }
      if (name === 'passwordConfirm' && value !== otherValue) {
        return 'パスワードが一致しません';
      }
      return '';
    }
  
    // エラーを表示
    function showError(name, message) {
      const error = form.querySelector(`.js-register-error[data-for="${name}"]`);
      if (!error) return;
      error.textContent = message;
      error.classList.toggle('is-visible', !!message);
    }
  
    // 入力時にリアルタイムバリデーション
    form.querySelectorAll('.js-register-input').forEach(input => {
      input.addEventListener('blur', () => {
        let error = '';
        if (input.name === 'passwordConfirm') {
          const password = form.querySelector('input[name="password"]').value;
          error = validate(input.name, input.value, password);
        } else {
          error = validate(input.name, input.value);
        }
        showError(input.name, error);
      });
    });
  
    // 送信時
    form.addEventListener('submit', e => {
      e.preventDefault();
  
      let hasError = false;
      const password = form.querySelector('input[name="password"]').value;
  
      form.querySelectorAll('.js-register-input').forEach(input => {
        let error = '';
        if (input.name === 'passwordConfirm') {
          error = validate(input.name, input.value, password);
        } else if (input.type !== 'checkbox') {
          error = validate(input.name, input.value);
        }
        
        if (error) {
          showError(input.name, error);
          hasError = true;
        }
      });
  
      // 利用規約同意チェック
      const agreeCheckbox = form.querySelector('input[name="agree"]');
      if (!agreeCheckbox.checked) {
        alert('利用規約に同意してください');
        return;
      }
  
      if (hasError) return;
  
      // 登録成功（ポートフォリオ用途のためアラートで代替）
      alert('会員登録が完了しました。ログインページからログインしてください。');
      form.reset();
      form.querySelectorAll('.js-register-error').forEach(el => {
        el.textContent = '';
        el.classList.remove('is-visible');
      });
      window.location.href = 'login.html';
    });
  }