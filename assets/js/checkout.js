(() => {
  const parseYen = value => Number(String(value).replace(/[^0-9]/g, '')) || 0;
  const formatYen = value => '¥' + Number(value || 0).toLocaleString('ja-JP');
  const cart = JSON.parse(localStorage.getItem('mofumori-cart') || '[]');
  const productsData = Array.isArray(window.products) ? window.products : [];
  const itemsRoot = document.querySelector('[data-checkout-items]');
  const totalRoot = document.querySelector('[data-checkout-total]');
  const form = document.querySelector('[data-checkout-form]');
  const findVariant = (product, sku) => product && sku && Array.isArray(product.variants) ? product.variants.find(item => item.sku === sku) : null;
  const orderItems = cart.map(item => {
    const product = productsData.find(p => p.id === item.id);
    if (!product) return null;
    const variant = findVariant(product, item.sku);
    const price = variant ? variant.price : product.price;
    const option = variant ? variant.label : '';
    return { id: product.id, sku: item.sku || '', option, name: product.name, price, qty: item.qty, image: product.image, subtotal: parseYen(price) * item.qty };
  }).filter(Boolean);
  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const orderId = 'MM-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  if (!orderItems.length) {
    if (itemsRoot) itemsRoot.innerHTML = '<p class="lead" style="font-size:14px;">カートに商品がありません。</p>';
    form?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'disabled');
    return;
  }
  if (itemsRoot) {
    itemsRoot.innerHTML = orderItems.map(item => `<div class="checkout-item"><img src="${item.image}" alt="${item.name}"><div><b>${item.name}</b>${item.option ? `<small>${item.option}</small>` : ''}<span>${item.price} × ${item.qty}</span></div><strong>${formatYen(item.subtotal)}</strong></div>`).join('');
  }
  if (totalRoot) totalRoot.textContent = formatYen(total);
  document.querySelector('[data-order-id]').value = orderId;
  document.querySelector('[data-order-items]').value = orderItems.map(item => `${item.name}${item.option ? ' / ' + item.option : ''} x ${item.qty} = ${formatYen(item.subtotal)}`).join('\n');
  document.querySelector('[data-order-total]').value = formatYen(total);
  form?.addEventListener('submit', () => {
    const formData = new FormData(form);
    const order = { id: orderId, total: formatYen(total), items: orderItems, customer: Object.fromEntries(formData.entries()), createdAt: new Date().toISOString() };
    localStorage.setItem('mofumori-last-order', JSON.stringify(order));
    localStorage.removeItem('mofumori-cart');
  });
})();
