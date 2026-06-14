import { fetchProducts, createProductCard } from './products.js';
import { addToCart } from './storage.js';
import { initCartDialog, openCartDialog } from '../component/cartDialog.js';

// URLからidを取得
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// 関連商品を取得（同カテゴリ優先・補完あり・4点）
function getRelatedProducts(products, currentProduct) {
  const sameCategory = products.filter(
    p => p.category === currentProduct.category && p.id !== currentProduct.id
  );
  const otherCategory = products.filter(
    p => p.category !== currentProduct.category
  );
  return [...sameCategory, ...otherCategory].slice(0, 4);
}

// 画像切り替え
function initThumbnails(product) {
  const mainImage = document.querySelector('.p-product-detail__main-image');
  const thumbBtns = document.querySelectorAll('.p-product-detail__thumb-btn');

  product.images.forEach((src, index) => {
    const btn = thumbBtns[index];
    if (!btn) return;
    const img = btn.querySelector('.p-product-detail__thumb-image');
    img.src = src;
    img.alt = `${product.name} ${index + 1}`;

    btn.addEventListener('click', () => {
      mainImage.src = src;
      thumbBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}

// カラーを描画
function renderColors(colors) {
  const list = document.querySelector('.p-product-detail__colors-list');
  list.innerHTML = colors.map(color => `
    <li class="p-product-detail__colors-item">
      <span class="p-product-detail__color-swatch" data-color="${color}"></span>
      <span class="p-product-detail__color-name">${color}</span>
    </li>
  `).join('');
}

// 商品情報を描画
function renderProduct(product) {
  const mainImage = document.querySelector('.p-product-detail__main-image');
  mainImage.src = product.images[0];
  mainImage.alt = product.name;

  document.querySelector('.p-product-detail__category').textContent = product.category.toUpperCase();
  document.querySelector('.p-product-detail__name').textContent = product.name;
  document.querySelector('.p-product-detail__price').textContent = `¥${product.price.toLocaleString()}`;
  document.querySelector('.p-product-detail__description').textContent = product.description;
  document.querySelector('.p-product-detail__stock').textContent = product.inStock ? '在庫あり' : '在庫なし';

  renderColors(product.colors);
  initThumbnails(product);
}

// 関連商品を描画
function renderRelatedProducts(products, currentProduct) {
  const related = getRelatedProducts(products, currentProduct);
  const list = document.querySelector('.p-product-detail__related-list');
  list.innerHTML = related.map(createProductCard).join('');
}

// 初期化
export async function initProductDetailPage() {
  const productDetail = document.querySelector('.p-product-detail');
  if (!productDetail) return;

  const id = getProductId();
  const products = await fetchProducts();
  const product = products.find(p => p.id === id);

  if (!product) return;

  renderProduct(product);
  renderRelatedProducts(products, product);
  initCartDialog();

  const addToCartBtn = document.querySelector('.p-product-detail__add-to-cart');
  addToCartBtn.addEventListener('click', () => {
    addToCart(product);
    openCartDialog(product);
  });
}