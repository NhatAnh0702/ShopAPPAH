// frontend/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
    // Require admin role
    if (localStorage.getItem('userRole') !== 'admin') {
      const container = document.querySelector('.admin-container');
      if (container) container.innerHTML = '<p style="padding:20px">Bạn không có quyền truy cập trang này.</p>';
      return;
    }

    const tableBody = document.getElementById('product-table-body');
    const modal = document.getElementById('modal-form');
    const modalTitle = document.getElementById('modal-title');
    const closeModalEls = document.querySelectorAll('.close-modal, .close-modal-btn');
    const deleteModal = document.getElementById('modal-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    const form = document.getElementById('product-create-form');
    const inputId = document.getElementById('product-id');
    const inputName = document.getElementById('p-name');
    const inputPrice = document.getElementById('p-price');
    const inputFile = document.getElementById('p-image-file');
    const inputImageOld = document.getElementById('p-image-url-old');
    const inputDesc = document.getElementById('p-desc');
    const btnAddNew = document.getElementById('btn-add-new');

    let productsCache = [];
    let deletingId = null;

    function openModal() { if (modal) modal.classList.add('show'); }
    function closeModal() { if (modal) modal.classList.remove('show'); }
    function openDeleteModal() { if (deleteModal) deleteModal.classList.add('show'); }
    function closeDeleteModal() { if (deleteModal) deleteModal.classList.remove('show'); }

    closeModalEls.forEach(el => el.addEventListener('click', () => { closeModal(); closeDeleteModal(); }));

    btnAddNew && btnAddNew.addEventListener('click', () => {
      if (inputId) inputId.value = '';
      if (inputName) inputName.value = '';
      if (inputPrice) inputPrice.value = '';
      if (inputDesc) inputDesc.value = '';
      if (inputImageOld) inputImageOld.value = '';
      if (inputFile) inputFile.value = '';
      if (modalTitle) modalTitle.innerText = 'Thêm sản phẩm';
      openModal();
    });

    // Use shared helpers from main.js: escapeHtml, formatPrice

    async function loadProducts() {
      if (!tableBody) return;
      tableBody.innerHTML = '<tr><td colspan="5">Đang tải...</td></tr>';
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (!res.ok) throw new Error('Không thể tải sản phẩm');
        const products = await res.json();
        productsCache = products;
        renderTable(products);
      } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="5">Không thể tải sản phẩm.</td></tr>';
      }
    }

    function renderTable(products) {
      if (!tableBody) return;
      if (!Array.isArray(products) || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Không có sản phẩm.</td></tr>';
        return;
      }

      tableBody.innerHTML = products.map(p => `
        <tr>
          <td><img src="${p.image||'/images/default.png'}" style="width:60px; height:60px; object-fit:cover;"></td>
          <td>${escapeHtml(p.name)}</td>
          <td style="text-align:right">${formatPrice(p.price)}</td>
          <td>${escapeHtml(p.description||'')}</td>
          <td style="text-align:right">
            <button class="btn-edit" data-id="${p._id}">Sửa</button>
            <button class="btn-delete" data-id="${p._id}" data-name="${escapeHtml(p.name)}">Xóa</button>
          </td>
        </tr>
      `).join('');

      // attach events
      document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', (e) => {
        deletingId = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const el = document.getElementById('delete-name');
        if (el) el.innerText = name;
        openDeleteModal();
      }));

      document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        const p = productsCache.find(x => x._id === id);
        if (!p) {
          if (window.CustomModal) await CustomModal.alert('Không tìm thấy sản phẩm'); else alert('Không tìm thấy sản phẩm');
          return;
        }
        if (inputId) inputId.value = p._id || '';
        if (inputName) inputName.value = p.name || '';
        if (inputPrice) inputPrice.value = p.price || '';
        if (inputDesc) inputDesc.value = p.description || '';
        if (inputImageOld) inputImageOld.value = p.image || '';
        if (inputFile) inputFile.value = '';
        if (modalTitle) modalTitle.innerText = 'Chỉnh sửa sản phẩm';
        openModal();
      }));
    }

    form && form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = inputId && inputId.value && inputId.value.trim();
      const name = inputName ? inputName.value.trim() : '';
      const price = inputPrice ? parseFloat(inputPrice.value) || 0 : 0;
      const description = inputDesc ? inputDesc.value.trim() : '';
      const oldImage = inputImageOld ? inputImageOld.value || '' : '';
      const file = inputFile && inputFile.files && inputFile.files[0];

      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);

      if (file) {
        formData.append('image', file);
      } else if (oldImage) {
        formData.append('image', oldImage);
      }

      try {
        const token = localStorage.getItem('token');
        const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (!res.ok) {
          const e = await res.json().catch(()=>({message:'Lỗi'}));
          if (window.CustomModal) await CustomModal.alert(e.message || 'Thao tác thất bại'); else alert(e.message || 'Thao tác thất bại');
          return;
        }
        // success
        if (inputId) inputId.value = '';
        form.reset();
        closeModal();
        loadProducts();
      } catch (err) {
        console.error(err);
        if (window.CustomModal) await CustomModal.alert('Lỗi khi lưu sản phẩm'); else alert('Lỗi khi lưu sản phẩm');
      }
    });

    confirmDeleteBtn && confirmDeleteBtn.addEventListener('click', async () => {
      if (!deletingId) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/products/${deletingId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Xóa thất bại');
        // optionally show toast
        closeDeleteModal();
        loadProducts();
      } catch (err) {
        console.error(err);
        if (window.CustomModal) await CustomModal.alert('Lỗi khi xóa'); else alert('Lỗi khi xóa');
      }
    });

    // initial load
    loadProducts();
    loadAdminOrders();

    // --- Orders management for admin (reads from localStorage orders) ---
    function loadAdminOrders() {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const adminBody = document.getElementById('admin-orders-body');
      if (!adminBody) return;

      adminBody.innerHTML = '';

      if (!orders || orders.length === 0) {
        adminBody.innerHTML = '<tr><td colspan="5">Chưa có đơn hàng nào trong hệ thống.</td></tr>';
        return;
      }

      orders.slice().reverse().forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="padding:10px; border-bottom:1px solid #eee">${escapeHtml(order.orderId || '')}</td>
          <td style="padding:10px; border-bottom:1px solid #eee">${escapeHtml(order.customerName || 'Khách vãng lai')}</td>
          <td style="padding:10px; border-bottom:1px solid #eee">${escapeHtml(order.date || '')}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right">${formatCurrency(order.totalAmount || 0)}</td>
          <td style="padding:10px; border-bottom:1px solid #eee">
            <select onchange="updateOrderStatus('${escapeHtml(order.orderId || '')}', this.value)" class="status-select">
              <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Chờ xử lý</option>
              <option value="Shipping" ${order.status === 'Shipping' ? 'selected' : ''}>Đang giao</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Đã giao</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Đã hủy</option>
            </select>
          </td>
        `;
        adminBody.appendChild(row);
      });
    }

    // updateOrderStatus exposed to window so inline onchange can call it
    window.updateOrderStatus = async function(orderId, newStatus) {
      let orders = JSON.parse(localStorage.getItem('orders')) || [];
      const idx = orders.findIndex(o => o.orderId === orderId);
      if (idx === -1) {
        if (window.CustomModal) await CustomModal.alert('Không tìm thấy đơn ' + orderId); else alert('Không tìm thấy đơn ' + orderId);
        return;
      }
      orders[idx].status = newStatus;
      localStorage.setItem('orders', JSON.stringify(orders));
      if (window.CustomModal) await CustomModal.alert(`Đã cập nhật đơn ${orderId} thành trạng thái: ${newStatus}`); else alert(`Đã cập nhật đơn ${orderId} thành trạng thái: ${newStatus}`);
      loadAdminOrders();
    };

    function formatCurrency(amount) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
  });