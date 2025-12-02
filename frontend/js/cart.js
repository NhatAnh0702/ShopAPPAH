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
            if (window.CustomModal) await CustomModal.alert('Không thể xóa sản phẩm'); else alert('Không thể xóa sản phẩm');
          }
        } catch (err) {
          console.error(err);
          if (window.CustomModal) await CustomModal.alert('Lỗi kết nối'); else alert('Lỗi kết nối');
        }
      });
    });

    // checkout action
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.onclick = async () => {
        try {
          await processCheckout();
        } catch (err) {
          console.error(err);
          if (window.CustomModal) await CustomModal.alert('Lỗi khi thực hiện thanh toán. Vui lòng thử lại.'); else alert('Lỗi khi thực hiện thanh toán. Vui lòng thử lại.');
        }
      };
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Đã có lỗi xảy ra khi tải giỏ hàng.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadCart);

// Process checkout: build an order, save to localStorage orders, then clear cart
async function processCheckout() {
  // Try to use backend cart if user logged in
  const token = localStorage.getItem('token');
  let items = [];

  if (token) {
    const res = await fetch(`${API_BASE_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      if (res.status === 401) {
        if (window.CustomModal) await CustomModal.alert('Vui lòng đăng nhập để thanh toán.'); else alert('Vui lòng đăng nhập để thanh toán.');
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Không thể lấy giỏ hàng');
    }
    const data = await res.json();
    items = (data.cart || []).map(i => ({
      productId: i.product ? i.product._id : null,
      name: i.product ? i.product.name : (i.name || ''),
      price: (i.product && i.product.price) || (i.price || 0),
      quantity: i.quantity || 1,
      image: (i.product && i.product.image) || ''
    }));
  } else {
    // Fallback to localStorage cart for guests
    items = JSON.parse(localStorage.getItem('cart')) || [];
  }

  if (!items || items.length === 0) {
    if (window.CustomModal) await CustomModal.alert('Giỏ hàng của bạn đang trống! Vui lòng mua thêm sản phẩm.'); else alert('Giỏ hàng của bạn đang trống! Vui lòng mua thêm sản phẩm.');
    return;
  }

  const totalAmount = items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);

  const newOrder = {
    orderId: 'ORD' + Date.now(),
    date: new Date().toLocaleString('vi-VN'),
    status: 'Pending',
    totalAmount: totalAmount,
    items: items
  };

  // Save to localStorage orders
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear cart: if logged in, remove each item via API; otherwise remove localStorage cart
  if (token) {
    try {
      for (const it of items) {
        if (it.productId) {
          await fetch(`${API_BASE_URL}/cart/${it.productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    } catch (e) {
      console.warn('Không thể xóa toàn bộ giỏ hàng trên server, tiếp tục xóa local.');
    }
  } else {
    localStorage.removeItem('cart');
  }

  // Update UI and redirect to profile
  if (window.CustomModal) await CustomModal.alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng.'); else alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
  window.location.href = 'profile.html';
}
