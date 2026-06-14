// modules/homePage.js
import { fetchProducts, createProductCard } from './products.js';

export async function initHomePage() {
  const list = document.querySelector('.js-new-arrivals-list');
  if (!list) return;

  const products = await fetchProducts();
  const newArrivals = products.slice(0, 4);
  list.innerHTML = newArrivals.map(createProductCard).join('');
}
