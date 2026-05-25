(() => {
  const root = document.querySelector('[data-order-receipt]');
  if (!root) return;
  const order = JSON.parse(localStorage.getItem('mofumori-last-order') || 'null');
  if (!order) {
    root.innerHTML = '<p class="lead">注文情報を確認できませんでした。</p>';
    return;
  }
  root.innerHTML = `
    <div class="cart-total"><span>注文番号</span><span>${order.id}</span></div>
    <div class="cart-total"><span>合計</span><span>${order.total}</span></div>
    <div class="receipt-items">${order.items.map(item => `<div class="checkout-item"><img src="${item.image}" alt="${item.name}"><div><b>${item.name}</b><span>${item.price} × ${item.qty}</span></div><strong>${item.subtotal.toLocaleString('ja-JP')}円</strong></div>`).join('')}</div>`;
})();