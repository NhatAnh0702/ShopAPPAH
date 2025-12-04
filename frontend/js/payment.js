// frontend/js/payment.js

async function loadPaymentPreview() {
  checkAuth();
  updateCartCount();

  const token = localStorage.getItem('token');
  const container = document.getElementById('payment-items');
  const totalEl = document.getElementById('payment-total');

  if (!token) {
    if (window.CustomModal) await CustomModal.alert('Vui lòng đăng nhập để thanh toán.'); else alert('Vui lòng đăng nhập để thanh toán.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      if (res.status === 401) {
        if (window.CustomModal) await CustomModal.alert('Vui lòng đăng nhập để thanh toán.'); else alert('Vui lòng đăng nhập để thanh toán.');
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Không thể tải giỏ hàng');
    }
    const data = await res.json();
    const items = (data.cart || []);

    if (!items || items.length === 0) {
      container.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
      totalEl.innerText = formatPrice(0);
      if (window.CustomModal) await CustomModal.alert('Giỏ hàng trống — vui lòng thêm sản phẩm trước khi thanh toán.'); else alert('Giỏ hàng trống — vui lòng thêm sản phẩm trước khi thanh toán.');
      window.location.href = 'cart.html';
      return;
    }

    let total = 0;
    const html = items.map((it) => {
      const p = it.product || {};
      const name = p.name || it.name || '';
      const price = (p.price != null ? p.price : it.price) || 0;
      const qty = it.quantity || 1;
      total += price * qty;
      const img = p.image || it.image || '/images/default.png';
      return `
        <div class="cart-item" style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #eee;">
          <img src="${img}" alt="${escapeHtml(name)}" style="width:64px; height:64px; object-fit:cover; border-radius:4px;">
          <div style="flex:1;">
            <div style="font-weight:600">${escapeHtml(name)}</div>
            <div>Số lượng: ${qty}</div>
          </div>
          <div style="min-width:120px; text-align:right;">${formatPrice(price)}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
    totalEl.innerText = formatPrice(total);

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Đã có lỗi khi tải dữ liệu.</p>';
  }
}

async function confirmPayment() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (window.CustomModal) await CustomModal.alert('Vui lòng đăng nhập để thanh toán.'); else alert('Vui lòng đăng nhập để thanh toán.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Không thể lấy giỏ hàng');
    const data = await res.json();
    const itemsRaw = (data.cart || []);
    if (!itemsRaw || itemsRaw.length === 0) {
      if (window.CustomModal) await CustomModal.alert('Giỏ hàng trống — không thể thanh toán.'); else alert('Giỏ hàng trống — không thể thanh toán.');
      window.location.href = 'cart.html';
      return;
    }

    const items = itemsRaw.map(i => ({
      productId: i.product ? i.product._id : null,
      name: i.product ? i.product.name : (i.name || ''),
      price: (i.product && i.product.price) || (i.price || 0),
      quantity: i.quantity || 1,
      image: (i.product && i.product.image) || ''
    }));
    const totalAmount = items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);

    // Confirm via CustomModal
    let ok = true;
    if (window.CustomModal && CustomModal.confirm) {
      ok = await CustomModal.confirm(`Bạn xác nhận thanh toán tổng cộng ${formatPrice(totalAmount)}?`, { title: 'Xác nhận thanh toán', okText: 'Thanh toán', cancelText: 'Hủy' });
    }
    if (!ok) return;

    const r = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items, totalAmount })
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({ message: 'Lỗi khi tạo đơn hàng' }));
      if (window.CustomModal) await CustomModal.alert(e.message || 'Lỗi khi tạo đơn hàng'); else alert(e.message || 'Lỗi khi tạo đơn hàng');
      return;
    }

    // Optional: clear server cart (best-effort)
    try {
      for (const it of items) {
        if (it.productId) {
          await fetch(`${API_BASE_URL}/cart/${it.productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        }
      }
    } catch (_) {}

    if (window.CustomModal) await CustomModal.alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng.'); else alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
    window.location.href = 'profile.html';

  } catch (err) {
    console.error(err);
    if (window.CustomModal) await CustomModal.alert('Lỗi khi thực hiện thanh toán. Vui lòng thử lại.'); else alert('Lỗi khi thực hiện thanh toán. Vui lòng thử lại.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadPaymentPreview();
  const backBtn = document.getElementById('btn-back-cart');
  const confirmBtn = document.getElementById('btn-confirm-pay');
  backBtn && (backBtn.onclick = () => { window.location.href = 'cart.html'; });
  confirmBtn && (confirmBtn.onclick = () => { confirmPayment(); });
});
