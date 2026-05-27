(() => {
  const parseYen = value => Number(String(value).replace(/[^0-9]/g, '')) || 0;
  const escapeText = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  document.addEventListener('DOMContentLoaded', () => {
    const productData = Array.isArray(window.products) ? window.products : [];
    const product = productData.find(item => item.id === new URLSearchParams(location.search).get('id')) || productData[0];
    const root = document.querySelector('[data-product-detail]');
    if (!root || !product) return;
    document.title = `${product.name} | MofuMori`;
    const description = product.description || product.short || 'ペットとの毎日を快適に整える商品です。';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description.replace(/<[^>]*>/g, '').slice(0, 150));
    const images = product.images && product.images.length ? product.images.slice(0, 5) : [product.image];
    const variants = Array.isArray(product.variants) && product.variants.length ? product.variants : [];
    const defaultVariant = variants[0] || null;
    const related = productData.filter(item => item.id !== product.id && item.category === product.category).slice(0, 4);
    const variantHtml = variants.length ? `<div class="variant-box variant-list"><div class="variant-label">選択肢</div><div class="variant-options">${variants.map((item, index) => `<button type="button" class="variant-option${index === 0 ? ' active' : ''}" data-variant-index="${index}"><span>${escapeText(item.label)}</span><strong>${escapeText(item.price)}</strong></button>`).join('')}</div></div>` : '';
    root.innerHTML = `<div class="breadcrumb"><a href="index.html">ホーム</a> / <a href="catalog.html">商品一覧</a> / ${escapeText(product.name)}</div><div class="detail-grid"><div><div class="gallery-main"><img src="${images[0]}" alt="${escapeText(product.name)}" data-main-image decoding="async"></div><div class="gallery-thumbs">${images.map((image, index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-thumb="${image}" aria-label="画像${index + 1}を見る"><img src="${image}" alt="${escapeText(product.name)} ${index + 1}" loading="lazy" decoding="async"></button>`).join('')}</div></div><div class="detail-info"><div class="eyebrow">${escapeText(product.category)}</div><h1>${escapeText(product.name)}</h1><div class="detail-price" data-detail-price>${escapeText(defaultVariant ? defaultVariant.price : product.price)}</div>${variantHtml}<p class="lead">${escapeText(description)}</p><ul class="specs">${(product.specs || []).map(spec => `<li>${escapeText(spec)}</li>`).join('')}</ul><div class="trust-row" aria-label="ショップ情報"><span>税込表示</span><span>全国配送対応</span><span>カート保存対応</span></div><p class="lead care-note">${escapeText(product.care || '')}</p><div class="qty-row"><label for="qty">数量</label><input id="qty" type="number" min="1" value="1"></div><button class="pill-btn" type="button" data-add-detail>カートに入れる</button><a class="outline-btn" href="catalog.html" style="margin-left:10px;">商品一覧へ戻る</a></div></div>${related.length ? `<section class="related-products"><div class="section-head"><h2>関連商品</h2><p>同じカテゴリの商品もあわせてご覧いただけます。</p></div><div class="related-grid">${related.map(item => `<a class="related-card" href="product.html?id=${encodeURIComponent(item.id)}"><img src="${item.image}" alt="${escapeText(item.name)}" loading="lazy" decoding="async"><b>${escapeText(item.name)}</b><span>${escapeText(item.price)}</span></a>`).join('')}</div></section>` : ''}`;
    const main = root.querySelector('[data-main-image]');
    root.querySelectorAll('[data-thumb]').forEach(button => button.addEventListener('click', () => {
      main.src = button.dataset.thumb;
      root.querySelectorAll('[data-thumb]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    }));
    let selectedVariantIndex = 0;
    const priceRoot = root.querySelector('[data-detail-price]');
    root.querySelectorAll('[data-variant-index]').forEach(button => button.addEventListener('click', () => {
      selectedVariantIndex = Number(button.dataset.variantIndex || 0);
      root.querySelectorAll('[data-variant-index]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const variant = variants[selectedVariantIndex];
      if (variant && priceRoot) priceRoot.textContent = variant.price;
    }));
    root.querySelector('[data-add-detail]')?.addEventListener('click', () => {
      const qty = Number(document.getElementById('qty').value || 1);
      const variant = variants.length ? variants[selectedVariantIndex] : null;
      window.addToCart(product.id, qty, variant ? variant.sku : null);
    });
    document.querySelector('[data-product-jsonld]')?.remove();
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.dataset.productJsonld = 'true';
    jsonLd.textContent = JSON.stringify({'@context':'https://schema.org','@type':'Product',name:product.name,image:images.map(image => new URL(image, location.href).href),description,brand:{'@type':'Brand',name:'MofuMori'},offers:{'@type':'Offer',priceCurrency:'JPY',price:parseYen(defaultVariant ? defaultVariant.price : product.price),availability:'https://schema.org/InStock',url:location.href}});
    document.head.appendChild(jsonLd);
  });
})();
