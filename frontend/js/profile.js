// frontend/js/profile.js
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('profile-container');
  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = '<p>Vui lòng đăng nhập để xem hồ sơ.</p>';
    return;
  }

  // Try to use stored userName; backend user endpoint is not implemented, so use stored info
  const name = localStorage.getItem('userName') || '';
  const email = localStorage.getItem('userEmail') || '';

  container.innerHTML = `
    <div><strong>Họ tên:</strong> ${escapeHtml(name)}</div>
    <div style="margin-top:8px;"><strong>Email:</strong> ${escapeHtml(email || '—')}</div>
  `;

  // Load order history into table
  function translateStatus(status) {
    switch (status) {
      case 'Pending': return 'Chờ xử lý';
      case 'Shipping': return 'Đang giao';
      case 'Delivered': return 'Đã giao';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  function loadOrderHistory() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderBody = document.getElementById('order-history-body');
    if (!orderBody) return;

    orderBody.innerHTML = '';

    if (orders.length === 0) {
      orderBody.innerHTML = '<tr><td colspan="5">Bạn chưa có đơn hàng nào.</td></tr>';
      return;
    }

    orders.slice().reverse().forEach(order => {
      const row = document.createElement('tr');

      let statusColor = 'black';
      if (order.status === 'Pending') statusColor = '#f39c12';
      else if (order.status === 'Shipping') statusColor = '#3498db';
      else if (order.status === 'Delivered') statusColor = '#27ae60';
      else if (order.status === 'Cancelled') statusColor = '#c0392b';

      row.innerHTML = `
        <td style="padding:8px; border-bottom:1px solid #eee;">${escapeHtml(order.orderId || '')}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">${escapeHtml(order.date || '')}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">${formatCurrency(order.totalAmount || 0)}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; color: ${statusColor}; font-weight:bold;">${escapeHtml(translateStatus(order.status))}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;"><button type="button" onclick="viewOrderDetail('${escapeHtml(order.orderId || '')}')">Xem</button></td>
      `;

      orderBody.appendChild(row);
    });
  }

  // Order modal handling
  const modal = document.getElementById('modal-order');
  const modalTitle = document.getElementById('modal-order-title');
  const modalBody = document.getElementById('modal-order-body');
  function openModal() { if (modal) modal.classList.add('show'); }
  function closeModal() { if (modal) modal.classList.remove('show'); }

  // close handlers (span and buttons)
  document.querySelectorAll('.close-modal, .close-modal-btn').forEach(el => {
    el.addEventListener('click', () => closeModal());
  });

  window.viewOrderDetail = async function(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = (orders || []).find(o => o.orderId === orderId);
    if (!order) {
      if (window.CustomModal) await CustomModal.alert('Không tìm thấy đơn hàng ' + orderId); else alert('Không tìm thấy đơn hàng ' + orderId);
      return;
    }

    if (modalTitle) modalTitle.innerText = `Đơn ${order.orderId} — ${order.date || ''}`;

    // build items list
    const items = order.items || [];
    const itemsHtml = items.map(it => `
      <div style="display:flex; gap:12px; align-items:center; padding:8px 0; border-bottom:1px solid #f0f0f0;">
        <img src="${escapeHtml(it.image || '/images/default.png')}" style="width:64px; height:64px; object-fit:cover; border:1px solid #eee;">
        <div style="flex:1;">
          <div style="font-weight:600">${escapeHtml(it.name || '')}</div>
          <div style="color:#666; font-size:13px">Số lượng: ${escapeHtml(String(it.quantity || 1))}</div>
        </div>
        <div style="min-width:100px; text-align:right">
          <div>${formatCurrency(it.price || 0)}</div>
        </div>
      </div>
    `).join('');

    const footerHtml = `
      <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
        <div style="color:#666; font-size:14px">Trạng thái: <strong style="color:#000">${escapeHtml(translateStatus(order.status))}</strong></div>
        <div style="font-weight:700; font-size:16px">Tổng: ${formatCurrency(order.totalAmount || 0)}</div>
      </div>
    `;

    if (modalBody) modalBody.innerHTML = `${itemsHtml}${footerHtml}`;
    openModal();
  };

  loadOrderHistory();

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
  });
});
