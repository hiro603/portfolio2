// modules/storage.js

const CART_KEY = 'ligne-cart';

// カートを取得
export function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// カートを保存
export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// カートに追加
export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartBadge();
}

// カートから削除
export function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  updateCartBadge();
}

// 数量を更新
export function updateQuantity(id, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);

  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
  }

  saveCart(cart);
  updateCartBadge();
}

// カートバッジを更新
export function updateCartBadge() {
  const badge = document.querySelector('.js-cart-badge');
  if (!badge) return;

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = total > 0 ? total : '';
}