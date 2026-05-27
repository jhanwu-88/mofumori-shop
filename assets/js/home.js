(() => {
  const parseYen = value => Number(String(value).replace(/[^0-9]/g, '')) || 0;
  const featuredIds = ['wjppwsqglsp','wjppzgl01','wjppwsqlaj','wjpplrcuopy','wjppmml01','wjppwsqlwf','wjppwyq01','wjppwsqglaj','wjppsjysl','wjppmkf01','wjpppethotm01','wjppdfbby05'];
  const escapeText = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function card(product) {
    return `<article class="product-card"><a class="product-image" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="${escapeText(product.name)}の詳細を見る"><img alt="${escapeText(product.name)}" src="${product.image}" loading="lazy" decoding="async"></a><div class="product-body"><span class="tag">${escapeText(product.category)}</span><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeText(product.name)}</a></h3><div class="price-line"><span class="price">${escapeText(product.price)}</span><span class="tag">${escapeText(product.badge || product.category)}</span></div><a class="shop-btn" href="product.html?id=${encodeURIComponent(product.id)}">詳細を見る</a></div></article>`;
  }

  function bindSlider() {
    const slides = [...document.querySelectorAll('.brand-slide')];
    const dots = [...document.querySelectorAll('[data-slide-dot]')];
    if (!slides.length) return;
    let active = 0;
    const show = index => {
      active = index;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    setInterval(() => show((active + 1) % slides.length), 5200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindSlider();
    const grid = document.querySelector('[data-product-grid]');
    const search = document.querySelector('[data-search]');
    const category = document.querySelector('[data-category]');
    const sort = document.querySelector('[data-sort]');
    const count = document.querySelector('[data-catalog-count]');
    if (!grid) return;
    const productData = Array.isArray(window.products) ? window.products : [];
    if (!productData.length) {
      grid.innerHTML = '<div class="empty-state">商品データを読み込めませんでした。ページを再読み込みしてください。</div>';
      return;
    }
    const isFeatured = grid.dataset.mode === 'featured';
    const featured = featuredIds.map(id => productData.find(product => product.id === id)).filter(Boolean);
    const allProducts = isFeatured && featured.length ? featured : (isFeatured ? productData.slice(0, 12) : productData.slice());
    const categories = [...new Set(productData.map(product => product.category))].sort((a, b) => a.localeCompare(b, 'ja'));
    if (category) {
      category.innerHTML = '<option value="">すべてのカテゴリ</option>' + categories.map(name => `<option value="${escapeText(name)}">${escapeText(name)}</option>`).join('');
      const paramCategory = new URLSearchParams(location.search).get('cat');
      if (paramCategory && categories.includes(paramCategory)) category.value = paramCategory;
    }
    function applySort(items) {
      const mode = sort ? sort.value : 'recommended';
      const list = items.slice();
      if (mode === 'price-asc') list.sort((a, b) => parseYen(a.price) - parseYen(b.price));
      if (mode === 'price-desc') list.sort((a, b) => parseYen(b.price) - parseYen(a.price));
      if (mode === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      return list;
    }
    function render() {
      const keyword = ((search && search.value) || '').trim().toLowerCase();
      const selected = (category && category.value) || '';
      const filtered = allProducts.filter(product => {
        const text = `${product.name} ${product.category} ${product.short}`.toLowerCase();
        return (!selected || product.category === selected) && (!keyword || text.includes(keyword));
      });
      const visible = applySort(filtered);
      if (count) count.textContent = isFeatured ? `${visible.length} 点` : `${visible.length} / ${productData.length} 商品`;
      grid.innerHTML = visible.length ? visible.map(card).join('') : '<div class="empty-state">条件に合う商品が見つかりません。</div>';
    }
    search?.addEventListener('input', render);
    category?.addEventListener('change', render);
    sort?.addEventListener('change', render);
    render();
  });
})();
