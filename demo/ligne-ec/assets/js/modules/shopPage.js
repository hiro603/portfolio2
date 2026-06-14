import { fetchProducts, filterProducts, createProductCard } from './products.js';

const ITEMS_PER_PAGE = 8;
let allProducts = [];
let currentCategory = 'all';
let currentPage = 1;

// ページネーション情報を更新
function updatePagination(filteredProducts) {
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(start, end);

  renderProducts(paginatedProducts);
  renderPaginationButtons(totalPages);
}

// 商品を描画
function renderProducts(products) {
  const list = document.querySelector('.js-shop-products-list');
  if (!list) return;
  list.innerHTML = products.map(createProductCard).join('');
}

// ページネーションボタンを描画
function renderPaginationButtons(totalPages) {
  const paginationContainer = document.querySelector('.js-shop-pagination');
  if (!paginationContainer || totalPages <= 1) {
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  paginationContainer.style.display = 'flex';
  let html = '';

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="p-shop-products__pagination-btn ${i === currentPage ? 'is-active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  paginationContainer.innerHTML = html;

  // ページネーションボタンのイベント登録
  paginationContainer.querySelectorAll('.p-shop-products__pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      const filtered = filterProducts(allProducts, currentCategory);
      updatePagination(filtered);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// 初期化
export async function initShopPage() {
  const filterBtns = document.querySelectorAll('.p-shop-products__filter-btn');
  if (!filterBtns.length) return;

  allProducts = await fetchProducts();
  currentPage = 1;

  // フィルターボタンのイベント
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      currentCategory = btn.dataset.category;
      currentPage = 1;
      const filtered = filterProducts(allProducts, currentCategory);
      updatePagination(filtered);
    });
  });

  // 初期表示
  const filtered = filterProducts(allProducts, currentCategory);
  updatePagination(filtered);
}