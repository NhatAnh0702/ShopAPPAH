// frontend/js/admin.js
document.addEventListener("DOMContentLoaded", () => {
  // Require admin role
  if (localStorage.getItem("userRole") !== "admin") {
    const container = document.querySelector(".admin-container");
    if (container)
      container.innerHTML =
        '<p style="padding:20px">Bạn không có quyền truy cập trang này.</p>';
    return;
  }

  const tableBody = document.getElementById("product-table-body");
  const modal = document.getElementById("modal-form");
  const modalTitle = document.getElementById("modal-title");
  const closeModalEls = document.querySelectorAll(
    ".close-modal, .close-modal-btn"
  );
  const deleteModal = document.getElementById("modal-delete");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

  const form = document.getElementById("product-create-form");
  const inputId = document.getElementById("product-id");
  const inputName = document.getElementById("p-name");
  const inputPrice = document.getElementById("p-price");
  const inputFile = document.getElementById("p-image-file");
  const inputImageOld = document.getElementById("p-image-url-old");
  const inputDesc = document.getElementById("p-desc");
  const inputCategory = document.getElementById("p-category");
  const btnAddNew = document.getElementById("btn-add-new");

  let productsCache = [];
  let deletingId = null;

  function openModal() {
    if (modal) modal.classList.add("show");
  }
  function closeModal() {
    if (modal) modal.classList.remove("show");
  }
  function openDeleteModal() {
    if (deleteModal) deleteModal.classList.add("show");
  }
  function closeDeleteModal() {
    if (deleteModal) deleteModal.classList.remove("show");
  }

  closeModalEls.forEach((el) =>
    el.addEventListener("click", () => {
      closeModal();
      closeDeleteModal();
    })
  );

  btnAddNew &&
    btnAddNew.addEventListener("click", () => {
      if (inputId) inputId.value = "";
      if (inputName) inputName.value = "";
      if (inputPrice) inputPrice.value = "";
      if (inputDesc) inputDesc.value = "";
      if (inputImageOld) inputImageOld.value = "";
      if (inputFile) inputFile.value = "";
      if (modalTitle) modalTitle.innerText = "Thêm sản phẩm";
      openModal();
    });

  // Use shared helpers from main.js: escapeHtml, formatPrice

  async function loadProducts() {
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="5">Đang tải...</td></tr>';
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Không thể tải sản phẩm");
      const products = await res.json();
      productsCache = products;
      renderTable(products);
    } catch (err) {
      console.error(err);
      tableBody.innerHTML =
        '<tr><td colspan="5">Không thể tải sản phẩm.</td></tr>';
    }
  }

  function renderTable(products) {
    if (!tableBody) return;
    if (!Array.isArray(products) || products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">Không có sản phẩm.</td></tr>';
      return;
    }

    tableBody.innerHTML = products
      .map(
        (p) => `
        <tr>
          <td><img src="${
            p.image || "/images/default.png"
          }" style="width:60px; height:60px; object-fit:cover;"></td>
          <td>${escapeHtml(p.name)}</td>
          <td style="text-align:right">${formatPrice(p.price)}</td>
          <td>${escapeHtml(p.category || 'Khác')}</td>
          <td>${escapeHtml(p.description || "")}</td>
          <td style="text-align:right">
            <button class="btn-edit" data-id="${p._id}">Sửa</button>
            <button class="btn-delete" data-id="${
              p._id
            }" data-name="${escapeHtml(p.name)}">Xóa</button>
          </td>
        </tr>
      `
      )
      .join("");

    // attach events
    document.querySelectorAll(".btn-delete").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        deletingId = btn.getAttribute("data-id");
        const name = btn.getAttribute("data-name");
        const el = document.getElementById("delete-name");
        if (el) el.innerText = name;
        openDeleteModal();
      })
    );

    document.querySelectorAll(".btn-edit").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        const id = btn.getAttribute("data-id");
        const p = productsCache.find((x) => x._id === id);
        if (!p) {
          if (window.CustomModal)
            await CustomModal.alert("Không tìm thấy sản phẩm");
          else alert("Không tìm thấy sản phẩm");
          return;
        }
        if (inputId) inputId.value = p._id || "";
        if (inputName) inputName.value = p.name || "";
        if (inputPrice) inputPrice.value = p.price || "";
        if (inputDesc) inputDesc.value = p.description || "";
          if (inputCategory) inputCategory.value = p.category || 'Khác';
        if (inputImageOld) inputImageOld.value = p.image || "";
        if (inputFile) inputFile.value = "";
        if (modalTitle) modalTitle.innerText = "Chỉnh sửa sản phẩm";
        openModal();
      })
    );
  }

  form &&
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = inputId && inputId.value && inputId.value.trim();
      const name = inputName ? inputName.value.trim() : "";
      const price = inputPrice ? parseFloat(inputPrice.value) || 0 : 0;
      const description = inputDesc ? inputDesc.value.trim() : "";
      const category = inputCategory ? inputCategory.value : 'Khác';
      const oldImage = inputImageOld ? inputImageOld.value || "" : "";
      const file = inputFile && inputFile.files && inputFile.files[0];

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);

      if (file) {
        formData.append("image", file);
      } else if (oldImage) {
        formData.append("image", oldImage);
      }

      try {
        const token = localStorage.getItem("token");
        const url = id
          ? `${API_BASE_URL}/products/${id}`
          : `${API_BASE_URL}/products`;
        const method = id ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({ message: "Lỗi" }));
          if (window.CustomModal)
            await CustomModal.alert(e.message || "Thao tác thất bại");
          else alert(e.message || "Thao tác thất bại");
          return;
        }
        // success
        if (inputId) inputId.value = "";
        form.reset();
        closeModal();
        loadProducts();
      } catch (err) {
        console.error(err);
        if (window.CustomModal) await CustomModal.alert("Lỗi khi lưu sản phẩm");
        else alert("Lỗi khi lưu sản phẩm");
      }
    });

  confirmDeleteBtn &&
    confirmDeleteBtn.addEventListener("click", async () => {
      if (!deletingId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/products/${deletingId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Xóa thất bại");
        closeDeleteModal();
        loadProducts();
      } catch (err) {
        console.error(err);
        if (window.CustomModal) await CustomModal.alert("Lỗi khi xóa");
        else alert("Lỗi khi xóa");
      }
    });

  // initial load
  loadProducts();
  loadAdminOrders();

  // Sidebar panel switching
  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.sidebar-link').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-target');
      document.querySelectorAll('[data-panel]').forEach(p => p.style.display = 'none');
      const panel = document.getElementById(target);
      if (panel) panel.style.display = 'block';
      const title = document.getElementById('panel-title');
      if (title) title.innerText = target === 'orders-panel' ? '📨 Quản lý đơn hàng' : '📦 Quản lý sản phẩm';
    });
  });

  // --- Orders management for admin (fetches from backend) ---
  async function loadAdminOrders() {
    const adminBody = document.getElementById('admin-orders-body');
    if (!adminBody) return;
    adminBody.innerHTML = '';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        adminBody.innerHTML = '<tr><td colspan="5">Bạn cần đăng nhập để xem đơn hàng.</td></tr>';
        return;
      }
      const res = await fetch(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 401) {
          adminBody.innerHTML = '<tr><td colspan="5">Không có quyền truy cập.</td></tr>';
          return;
        }
        throw new Error('Không thể tải đơn hàng');
      }
      const orders = await res.json();

      if (!Array.isArray(orders) || orders.length === 0) {
        adminBody.innerHTML = '<tr><td colspan="5">Chưa có đơn hàng nào trong hệ thống.</td></tr>';
        return;
      }

      orders.slice().reverse().forEach((order) => {
        const row = document.createElement('tr');
        const customer = (order.user && (order.user.name || order.user.email)) || 'Khách vãng lai';
        row.innerHTML = `
          <td style="padding:10px; border-bottom:1px solid #eee">${escapeHtml(order._id || '')}</td>
          <td style="padding:10px; border-bottom:1px solid #eee">${escapeHtml(customer)}</td>
          <td style="padding:10px; border-bottom:1px solid #eee">${escapeHtml(new Date(order.createdAt).toLocaleString('vi-VN') || '')}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right">${formatCurrency(order.totalAmount || 0)}</td>
          <td style="padding:10px; border-bottom:1px solid #eee">
            <select data-id="${escapeHtml(order._id || '')}" class="status-select">
              <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Chờ xử lý</option>
              <option value="Shipping" ${order.status === 'Shipping' ? 'selected' : ''}>Đang giao</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Đã giao</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Đã hủy</option>
            </select>
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right">
            <button class="btn-danger btn-delete-order" data-id="${escapeHtml(order._id || '')}">Xóa</button>
          </td>
        `;
        adminBody.appendChild(row);
      });

      // attach change handlers
      document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
          const id = select.getAttribute('data-id');
          const v = select.value;
          await window.updateOrderStatus(id, v);
        });
      });

      // attach delete handlers for orders
      document.querySelectorAll('.btn-delete-order').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (!id) return;
          let ok = false;
          if (window.CustomModal && CustomModal.confirm) {
            ok = await CustomModal.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?', { title: 'Xác nhận xóa', okText: 'Xóa', cancelText: 'Hủy' });
          } else {
            ok = confirm('Bạn có chắc chắn muốn xóa đơn hàng này?');
          }
          if (!ok) return;
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
              const e = await res.json().catch(() => ({ message: 'Xóa thất bại' }));
              if (window.CustomModal) await CustomModal.alert(e.message || 'Xóa thất bại'); else alert(e.message || 'Xóa thất bại');
              return;
            }
            if (window.CustomModal) await CustomModal.alert('Đã xóa đơn hàng'); else alert('Đã xóa đơn hàng');
            loadAdminOrders();
          } catch (err) {
            console.error(err);
            if (window.CustomModal) await CustomModal.alert('Lỗi khi xóa đơn hàng'); else alert('Lỗi khi xóa đơn hàng');
          }
        });
      });

    } catch (err) {
      console.error(err);
      adminBody.innerHTML = '<tr><td colspan="5">Đã có lỗi khi tải đơn hàng.</td></tr>';
    }
  }

  // updateOrderStatus exposed to window so inline onchange can call it
  window.updateOrderStatus = async function (orderId, newStatus) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if (window.CustomModal) await CustomModal.alert('Bạn cần đăng nhập.'); else alert('Bạn cần đăng nhập.');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ message: 'Lỗi khi cập nhật trạng thái' }));
        if (window.CustomModal) await CustomModal.alert(e.message || 'Lỗi khi cập nhật trạng thái'); else alert(e.message || 'Lỗi khi cập nhật trạng thái');
        return;
      }
      if (window.CustomModal) await CustomModal.alert(`Đã cập nhật đơn ${orderId} thành trạng thái: ${newStatus}`); else alert(`Đã cập nhật đơn ${orderId} thành trạng thái: ${newStatus}`);
      loadAdminOrders();
    } catch (err) {
      console.error(err);
      if (window.CustomModal) await CustomModal.alert('Lỗi khi cập nhật trạng thái'); else alert('Lỗi khi cập nhật trạng thái');
    }
  };

  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }
});
