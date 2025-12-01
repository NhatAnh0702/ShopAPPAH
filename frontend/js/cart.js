// Fetch user's cart from backend and render it
async function loadCart() {
  const container = document.getElementById('cart-list');
  container.innerHTML = '';

  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = '<p>Vui lòng đăng nhập để xem giỏ hàng.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) {
        container.innerHTML = '<p>Vui lòng đăng nhập để xem giỏ hàng.</p>';
        return;
      }
      throw new Error('Lỗi khi tải giỏ hàng');
    }

    const data = await res.json();
    const items = (data.cart || []);

    if (items.length === 0) {
      container.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
      document.getElementById('cart-total').innerText = formatPrice(0);
      return;
    }

    let total = 0;
    for (const it of items) {
      const p = it.product || {};
      const qty = it.quantity || 1;
      const price = p.price || 0;
      total += price * qty;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${p.image || '/images/default.png'}" alt="${escapeHtml(p.name)}" style="width:80px; height:80px; object-fit:cover;">
        <div style="flex:1; margin-left:12px;">
          <div style="font-weight:600">${escapeHtml(p.name)}</div>
          <div>Số lượng: ${qty}</div>
        </div>
        <div style="min-width:120px; text-align:right;">
          <div>${formatPrice(price)}</div>
          <button data-id="${p._id}" class="btn-remove" style="margin-top:6px;">Xóa</button>
        </div>
      `;

      container.appendChild(itemEl);
    }

    document.getElementById('cart-total').innerText = formatPrice(total);

    // attach remove handlers
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const pid = btn.getAttribute('data-id');
        try {
          const r = await fetch(`${API_BASE_URL}/cart/${pid}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (r.ok) {
            await loadCart();
          } else {
            alert('Không thể xóa sản phẩm');
          }
        } catch (err) {
          console.error(err);
          alert('Lỗi kết nối');
        }
      });
    });

    // checkout action (placeholder)
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => alert('Chức năng thanh toán chưa được triển khai');
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Đã có lỗi xảy ra khi tải giỏ hàng.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadCart);
