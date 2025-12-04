// frontend/js/home.js

const productListEl = document.getElementById('product-list');

// Hàm tải sản phẩm từ API
async function loadProducts() {
    try {
        const params = new URLSearchParams(window.location.search);
        const cat = (params.get('category') || '').trim();
        const qParam = (params.get('search') || '').trim().toLowerCase();

        const url = cat ? `${API_BASE_URL}/products?category=${encodeURIComponent(cat)}` : `${API_BASE_URL}/products`;
        const res = await fetch(url);

        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);

        let products = await res.json();

        // Nếu có query search trong URL thì lọc sản phẩm
        const q = qParam;
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
            <p class="category">${escapeHtml(p.category || 'Khác')}</p>
            <button class="btn" >Xem chi tiết</button>
        </div>
    `).join('');
}

// Hàm chuyển hướng
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadProducts);

// Category filter bar
function applyCategoryFilter(cat) {
    const params = new URLSearchParams(window.location.search);
    if (cat) params.set('category', cat); else params.delete('category');
    window.location.search = params.toString();
}
