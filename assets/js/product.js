(() => {
  const parseYen = value => Number(String(value).replace(/[^0-9]/g, '')) || 0;
  const escapeText = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  const variantGroups = [
    {
      name: 'ケージ取付タイプ 2.3L',
      items: [
        { id: 'wjppwsqlwf', label: 'スマホ遠隔操作式-WiFi必要' },
        { id: 'wjppwsqlaj', label: 'タイマー式-WiFi不要' }
      ]
    },
    {
      name: 'ケージ取付タイプ 2.3L・上位モデル',
      items: [
        { id: 'wjppwsqglsp', label: 'カメラ付き遠隔操作式' },
        { id: 'wjppwsqglwf', label: 'スマホ遠隔操作式' },
        { id: 'wjppwsqglaj', label: 'タイマー式' }
      ]
    },
    {
      name: '魚用オートフィーダー 200ML',
      items: [
        { id: 'wjppwyq01', label: 'タイプ1・ブラック' },
        { id: 'wjppwyq02', label: 'タイプ3・アップグレードブラック' }
      ]
    },
    {
      name: '給水器フィルター WF003',
      items: [
        { id: 'wjppysjl03-lx5', label: '交換用 5枚セット' },
        { id: 'wjppysjl03-lx10', label: '交換用 10枚セット' }
      ]
    }
  ];
  const findVariantGroup = id => variantGroups.find(group => group.items.some(item => item.id === id));

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const productData = Array.isArray(window.products)
      ? window.products
      : (typeof products !== 'undefined' && Array.isArray(products) ? products : []);
    const product = productData.find(item => item.id === params.get('id')) || productData[0];
    const root = document.querySelector('[data-product-detail]');
    if (!root || !product) return;

    document.title = `${product.name} | MofuMori`;
    const description = product.description || product.short || 'ペットとの毎日を快適にする商品です。';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description.replace(/<[^>]*>/g, '').slice(0, 150));

    const images = product.images && product.images.length ? product.images.slice(0, 5) : [product.image];
    const related = productData.filter(item => item.id !== product.id && item.category === product.category).slice(0, 4);
    const variantGroup = findVariantGroup(product.id);
    const variants = variantGroup
      ? variantGroup.items.map(item => ({ ...item, product: productData.find(productItem => productItem.id === item.id) })).filter(item => item.product)
      : [];

    const variantHtml = variants.length > 1 ? `
      <div class="variant-box">
        <label for="variant-select">タイプ</label>
        <select id="variant-select" data-variant-select>
          ${variants.map(item => `<option value="${item.id}" ${item.id === product.id ? 'selected' : ''}>${escapeText(item.label)} / ${item.product.price}</option>`).join('')}
        </select>
      </div>` : '';

    root.innerHTML = `
      <div class="breadcrumb"><a href="index.html">ホーム</a> / <a href="catalog.html">商品一覧</a> / ${escapeText(product.name)}</div>
      <div class="detail-grid">
        <div>
          <div class="gallery-main"><img src="${images[0]}" alt="${escapeText(product.name)}" data-main-image decoding="async"></div>
          <div class="gallery-thumbs">${images.map((image, index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-thumb="${image}" aria-label="画像${index + 1}を見る"><img src="${image}" alt="${escapeText(product.name)} ${index + 1}" loading="lazy" decoding="async"></button>`).join('')}</div>
        </div>
        <div class="detail-info">
          <div class="eyebrow">${escapeText(product.category)}</div>
          <h1>${escapeText(product.name)}</h1>
          <div class="detail-price">${product.price}</div>
          ${variantHtml}
          <p class="lead">${escapeText(description)}</p>
          <ul class="specs">${(product.specs || []).map(spec => `<li>${escapeText(spec)}</li>`).join('')}</ul>
          <div class="trust-row" aria-label="ショップ情報"><span>税込表示</span><span>全国配送対応</span><span>カート保存対応</span></div>
          <p class="lead care-note">${escapeText(product.care || '')}</p>
          <div class="qty-row"><label for="qty">数量</label><input id="qty" type="number" min="1" value="1"></div>
          <button class="pill-btn" type="button" onclick="addToCart('${product.id}', Number(document.getElementById('qty').value || 1))">カートに入れる</button>
          <a class="outline-btn" href="catalog.html" style="margin-left:10px;">商品一覧へ戻る</a>
        </div>
      </div>
      ${related.length ? `<section class="related-products"><div class="section-head"><h2>関連商品</h2><p>同じカテゴリの商品もあわせてご覧いただけます。</p></div><div class="related-grid">${related.map(item => `<a class="related-card" href="product.html?id=${encodeURIComponent(item.id)}"><img src="${item.image}" alt="${escapeText(item.name)}" loading="lazy" decoding="async"><b>${escapeText(item.name)}</b><span>${item.price}</span></a>`).join('')}</div></section>` : ''}`;

    const main = root.querySelector('[data-main-image]');
    root.querySelectorAll('[data-thumb]').forEach(button => {
      button.addEventListener('click', () => {
        main.src = button.dataset.thumb;
        root.querySelectorAll('[data-thumb]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
      });
    });

    const variantSelect = root.querySelector('[data-variant-select]');
    variantSelect?.addEventListener('change', () => {
      location.href = `product.html?id=${encodeURIComponent(variantSelect.value)}`;
    });

    const oldJsonLd = document.querySelector('[data-product-jsonld]');
    if (oldJsonLd) oldJsonLd.remove();
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.dataset.productJsonld = 'true';
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: images.map(image => new URL(image, location.href).href),
      description,
      brand: { '@type': 'Brand', name: 'MofuMori' },
      offers: { '@type': 'Offer', priceCurrency: 'JPY', price: parseYen(product.price), availability: 'https://schema.org/InStock', url: location.href }
    });
    document.head.appendChild(jsonLd);
  });
})();