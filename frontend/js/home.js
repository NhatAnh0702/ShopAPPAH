// frontend/js/home.js

const productListEl = document.getElementById('product-list');

// Hàm tải sản phẩm từ API
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);

        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);

        let products = await res.json();

        // Nếu có query search trong URL thì lọc sản phẩm
        const params = new URLSearchParams(window.location.search);
        const q = (params.get('search') || '').trim().toLowerCase();
        if (q) {
            products = products.filter(p => (p.name || '').toLowerCase().includes(q));
        }

        renderProducts(products);
    } catch (err) {
        console.error('Lỗi khi load products:', err);
        if(productListEl) productListEl.innerHTML = '<p style="color:red">Không thể tải danh sách sản phẩm. Vui lòng kiểm tra Server.</p>';
    }
}

// Hàm hiển thị sản phẩm ra HTML
function renderProducts(products) {
    // Kiểm tra element tồn tại chưa
    if (!productListEl) return;

    if (!Array.isArray(products) || products.length === 0) {
        productListEl.innerHTML = '<p>Không có sản phẩm nào.</p>';
        return;
    }

    // Sử dụng map để tạo HTML string
    productListEl.innerHTML = products.map(p => `
        <div class="product-card" onclick="viewProduct('${p._id}')">
            <img src="${p.image || '/images/default.png'}" alt="${escapeHtml(p.name)}">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="price">${formatPrice(p.price)}</p>
            <button class="btn" >Xem chi tiết</button>
        </div>
    `).join('');
}

// Hàm chuyển hướng
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadProducts);
