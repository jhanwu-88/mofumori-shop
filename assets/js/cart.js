const yenNumber = value => Number(String(value).replace(/[^0-9]/g, '')) || 0;
const formatYen = value => '¥' + value.toLocaleString('ja-JP');
const getCart = () => JSON.parse(localStorage.getItem('mofumori-cart') || '[]');
const setCart = cart => {
  localStorage.setItem('mofumori-cart', JSON.stringify(cart));
  updateCartCount();
};
function addToCart(id, qty = 1) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  const cart = getCart();
  const found = cart.find(item => item.id === id);
  if (found) found.qty += qty;
  else cart.push({ id, qty });
  setCart(cart);
  renderCart(true);
}
function removeFromCart(id) {
  setCart(getCart().filter(item => item.id !== id));
  renderCart(true);
}
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count; });
}
function renderCart(open = false) {
  const panel = document.querySelector('[data-cart-panel]');
  if (!panel) return;
  const cart = getCart();
  const rows = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return '';
    return `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div><b>${product.name}</b><span>${product.price} × ${item.qty}</span><button class="cart-remove" type="button" onclick="removeFromCart('${item.id}')">削除</button></div></div>`;
  }).join('') || '<p class="lead" style="font-size:14px;margin:0 0 12px;">カートは空です。</p>';
  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? yenNumber(product.price) * item.qty : 0);
  }, 0);
  const checkout = cart.length ? '<a class="shop-btn checkout-link" href="checkout.html">購入手続きへ</a>' : '<a class="shop-btn checkout-link disabled" href="index.html#products">商品を選ぶ</a>';
  panel.innerHTML = `<h2>カート</h2>${rows}<div class="cart-total"><span>合計</span><span>${formatYen(total)}</span></div>${checkout}`;
  if (open) panel.classList.add('open');
}
function bindCart() {
  updateCartCount();
  renderCart(false);
  document.querySelectorAll('[data-cart-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.querySelector('[data-cart-panel]');
      renderCart(false);
      panel?.classList.toggle('open');
    });
  });
}
document.addEventListener('DOMContentLoaded', bindCart);