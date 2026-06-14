import { getCart, removeFromCart, updateQuantity, updateCartBadge } from './storage.js';

// カートアイテムのHTML生成
function createCartItem(item) {
  return `
    <li class="p-cart__item" data-id="${item.id}">
      <div class="p-cart__item__image-wrapper">
        <img
          src="${item.thumbnail}"
          alt="${item.name}"
          class="p-cart-item__image"
          width="120"
          height="80"
        >
      </div>
      <div class="p-cart-item__info">
        <p class="p-cart-item__category">${item.category.toUpperCase()}</p>
        <p class="p-cart-item__name">${item.name}</p>
        <p class="p-cart-item__price">¥${item.price.toLocaleString()}</p>
      </div>
      <div class="p-cart-item__quantity">
        <button class="p-cart-item__quantity-btn js-quantity-minus" data-id="${item.id}">−</button>
        <span class="p-cart-item__quantity-num">${item.quantity}</span>
        <button class="p-cart-item__quantity-btn js-quantity-plus" data-id="${item.id}">+</button>
      </div>
      <p class="p-cart-item__subtotal">¥${(item.price * item.quantity).toLocaleString()}</p>
      <button class="p-cart-item__remove js-cart-remove" data-id="${item.id}">削除</button>
    </li>
  `;
}

// 合計金額を計算・表示
function renderTotal(cart) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector('.js-cart-subtotal').textContent = `¥${total.toLocaleString()}`;
  document.querySelector('.js-cart-total').textContent = `¥${total.toLocaleString()}`;
}

// カートを描画
function renderCart() {
  const cart = getCart();
  const cartList = document.querySelector('.js-cart-list');
  const cartEmpty = document.querySelector('.js-cart-empty');
  const cartContent = document.querySelector('.js-cart-content');

  if (!cartList) return;

  if (cart.length === 0) {
    cartEmpty.style.display = 'block';
    cartContent.style.display = 'none';
    return;
  }

  cartEmpty.style.display = 'none';
  cartContent.style.display = 'block';
  cartList.innerHTML = cart.map(createCartItem).join('');
  renderTotal(cart);

  // 削除ボタン
  document.querySelectorAll('.js-cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
      renderCart();
    });
  });

  // 数量増減ボタン
  document.querySelectorAll('.js-quantity-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = getCart().find(i => i.id === btn.dataset.id);
      if (!item) return;
      updateQuantity(btn.dataset.id, item.quantity - 1);
      renderCart();
    });
  });

  document.querySelectorAll('.js-quantity-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = getCart().find(i => i.id === btn.dataset.id);
      if (!item) return;
      updateQuantity(btn.dataset.id, item.quantity + 1);
      renderCart();
    });
  });
}

// 初期化
export function initCart() {
  const cartList = document.querySelector('.js-cart-list');
  if (!cartList) return;

  renderCart();
  updateCartBadge();
}