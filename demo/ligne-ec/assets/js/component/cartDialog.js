// components/cartDialog.js

export function initCartDialog() {
    const dialog = document.querySelector('.js-cart-dialog');
    const closeBtn = document.querySelector('.js-cart-dialog-close');
    if (!dialog) return;
  
    closeBtn.addEventListener('click', () => {
      dialog.close();
    });
  
    // ダイアログの外側クリックで閉じる
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  }
  
  export function openCartDialog(product) {
    const dialog = document.querySelector('.js-cart-dialog');
    const image = document.querySelector('.js-cart-dialog-image');
    const name = document.querySelector('.js-cart-dialog-name');
    const price = document.querySelector('.js-cart-dialog-price');
    if (!dialog) return;
  
    image.src = product.thumbnail;
    image.alt = product.name;
    name.textContent = product.name;
    price.textContent = `¥${product.price.toLocaleString()}`;
  
    dialog.showModal();
  }