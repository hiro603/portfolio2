// 商品データの取得
export async function fetchProducts() {
    const response = await fetch('./assets/data/products.json');
    const data = await response.json();
    return data.products;
  }
  
  // カテゴリでフィルタリング
  export function filterProducts(products, category) {
    if (category === 'all') return products;
    return products.filter(product => product.category === category);
  }
  
  // 商品カードのHTML生成
  export function createProductCard(product) {
    return `
      <li class="c-product-card">
        <a href="product-detail.html?id=${product.id}" class="c-product-card__link">
          <div class="c-product-card__image-wrapper">
            <img
              src="${product.thumbnail}"
              alt="${product.name}"
              class="c-product-card__image"
              width="640"
              height="426"
              loading="lazy"
            >
          </div>
          <div class="c-product-card__body">
            <p class="c-product-card__category">${product.category}</p>
            <h2 class="c-product-card__name">${product.name}</h2>
            <p class="c-product-card__price">¥${product.price.toLocaleString()}</p>
          </div>
        </a>
      </li>
    `;
  }