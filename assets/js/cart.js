const yenNumber = value => Number(String(value).replace(/[^0-9]/g, '')) || 0;
const formatYen = value => '¥' + Number(value || 0).toLocaleString('ja-JP');
const getCart = () => JSON.parse(localStorage.getItem('mofumori-cart') || '[]');
const setCart = cart => { localStorage.setItem('mofumori-cart', JSON.stringify(cart)); updateCartCount(); };
const findProduct = id => (Array.isArray(window.products) ? window.products : []).find(item => item.id === id);
const findVariant = (product, sku) => product && sku && Array.isArray(product.variants) ? product.variants.find(item => item.sku === sku) : null;
function addToCart(id, qty = 1, sku = null) {
  const product = findProduct(id);
  if (!product) return;
  const fallbackSku = sku || (Array.isArray(product.variants) && product.variants.length === 1 ? product.variants[0].sku : null);
  const key = fallbackSku ? `${id}::${fallbackSku}` : id;
  const cart = getCart();
  const found = cart.find(item => (item.key || item.id) === key);
  if (found) found.qty += qty;
  else cart.push({ key, id, sku: fallbackSku, qty });
  setCart(cart);
  renderCart(true);
}
function removeFromCart(key) { setCart(getCart().filter(item => (item.key || item.id) !== key)); renderCart(true); }
function updateCartCount() { const count = getCart().reduce((sum, item) => sum + item.qty, 0); document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count; }); }
function renderCart(open = false) {
  const panel = document.querySelector('[data-cart-panel]');
  if (!panel) return;
  const cart = getCart();
  const rows = cart.map(item => {
    const product = findProduct(item.id);
    if (!product) return '';
    const variant = findVariant(product, item.sku);
    const key = item.key || item.id;
    const price = variant ? variant.price : product.price;
    const option = variant ? `<small>${variant.label}</small>` : '';
    return `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div><b>${product.name}</b>${option}<span>${price} × ${item.qty}</span><button class="cart-remove" type="button" onclick="removeFromCart('${key}')">削除</button></div></div>`;
  }).join('') || '<p class="lead" style="font-size:14px;margin:0 0 12px;">カートは空です。</p>';
  const total = cart.reduce((sum, item) => {
    const product = findProduct(item.id);
    const variant = findVariant(product, item.sku);
    const price = variant ? variant.price : product?.price;
    return sum + (price ? yenNumber(price) * item.qty : 0);
  }, 0);
  const checkout = cart.length ? '<a class="shop-btn checkout-link" href="checkout.html">購入手続きへ</a>' : '<a class="shop-btn checkout-link disabled" href="index.html#products">商品を選ぶ</a>';
  panel.innerHTML = `<h2>カート</h2>${rows}<div class="cart-total"><span>合計</span><span>${formatYen(total)}</span></div>${checkout}`;
  if (open) panel.classList.add('open');
}
function bindCart() {
  updateCartCount();
  renderCart(false);
  document.querySelectorAll('[data-cart-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const panel = document.querySelector('[data-cart-panel]');
    renderCart(false);
    panel?.classList.toggle('open');
  }));
}
document.addEventListener('DOMContentLoaded', bindCart);
