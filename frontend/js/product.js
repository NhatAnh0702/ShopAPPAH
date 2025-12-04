// Biến lưu thông tin sản phẩm hiện tại
let currentProduct = null;

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const productDetailEl = document.getElementById('product-detail');
const loadingEl = document.getElementById('loading');
const qtyInput = document.getElementById('p-qty');

function sanitizeQty(raw) {
    const s = String(raw == null ? '' : raw).replace(/[^0-9]/g, '');
    let n = parseInt(s, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 999999) n = 999999; // hard cap to avoid overflow
    return n;
}

function setupQtyValidation() {
    if (!qtyInput) return;
    // Normalize current value
    qtyInput.value = sanitizeQty(qtyInput.value);

    qtyInput.addEventListener('input', () => {
        const caret = qtyInput.selectionStart;
        const before = qtyInput.value;
        const normalized = String(before).replace(/[^0-9]/g, '');
        qtyInput.value = normalized;
        // keep caret position best-effort
        try { qtyInput.setSelectionRange(caret, caret); } catch (_) {}
    });

    qtyInput.addEventListener('blur', () => {
        qtyInput.value = sanitizeQty(qtyInput.value);
    });

    // Prevent non-number paste
    qtyInput.addEventListener('paste', (e) => {
        const txt = (e.clipboardData || window.clipboardData).getData('text');
        if (/[^0-9]/.test(txt)) {
            e.preventDefault();
            const cleaned = txt.replace(/[^0-9]/g, '');
            if (cleaned) document.execCommand('insertText', false, cleaned);
        }
    });
}

async function loadProductDetail() {
    if (!productId) {
        if (window.CustomModal) await CustomModal.alert('Không tìm thấy ID sản phẩm!'); else alert('Không tìm thấy ID sản phẩm!');
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`);
        
        if (!res.ok) throw new Error("Không thể tải sản phẩm");

        currentProduct = await res.json();
        renderProduct(currentProduct);

    } catch (err) {
        console.error(err);
        loadingEl.innerText = 'Lỗi: Không tìm thấy sản phẩm.';
    }
}

function renderProduct(p) {
    document.getElementById('p-img').src = p.image || '/images/default.png';
    document.getElementById('p-name').innerText = p.name;
    document.getElementById('p-price').innerText = formatPrice(p.price);
    document.getElementById('p-desc').innerText = p.description || 'Chưa có mô tả.';
    const catEl = document.getElementById('p-category');
    if (catEl) catEl.innerText = (p.category || 'Khác');
    
    loadingEl.style.display = 'none';
    productDetailEl.style.display = 'flex';
}

function changeQty(amount) {
    let currentQty = sanitizeQty(qtyInput.value);
    currentQty += amount;
    if (currentQty < 1) currentQty = 1;
    qtyInput.value = String(currentQty);
}

async function isRequestLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Lưu lại URL hiện tại để sau khi login quay lại đúng trang này
        sessionStorage.setItem('redirectAfterLogin', window.location.href);

        let go = true;
        if (window.CustomModal) {
            go = await CustomModal.confirm('Bạn cần đăng nhập để thực hiện chức năng này. Đi đến trang đăng nhập?', { title: 'Yêu cầu đăng nhập', okText: 'Đến đăng nhập', cancelText: 'Hủy' });
        } else {
            go = confirm('Bạn cần đăng nhập để thực hiện chức năng này. Đi đến trang đăng nhập?');
        }

        if (go) {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}

async function handleAddToCart() {
    if (!(await isRequestLoggedIn())) return;
    const quantity = sanitizeQty(qtyInput.value);

    try {
        const token = localStorage.getItem('token');
        
        // Gọi API thêm vào giỏ (Bạn cần backend route: POST /api/cart)
        const res = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Gửi token để xác thực
            },
            body: JSON.stringify({
                productId: currentProduct._id,
                quantity: quantity
            })
        });

        const data = await res.json();

        if (res.ok) {
            if (window.CustomModal) await CustomModal.alert('Đã thêm vào giỏ hàng thành công!'); else alert('Đã thêm vào giỏ hàng thành công!');
            // Cập nhật lại số lượng hiển thị ở header
            if (typeof updateCartCount === 'function') await updateCartCount();
        } else {
            if (window.CustomModal) await CustomModal.alert(data.message || 'Lỗi khi thêm vào giỏ'); else alert(data.message || 'Lỗi khi thêm vào giỏ');
        }

    } catch (err) {
        console.error(err);
        if (window.CustomModal) await CustomModal.alert('Lỗi kết nối server'); else alert('Lỗi kết nối server');
    }
}

async function handleBuyNow() {
    if (!(await isRequestLoggedIn())) return;
    const quantity = sanitizeQty(qtyInput.value);
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: currentProduct._id,
                quantity: quantity
            })
        });

        if (res.ok) {
            window.location.href = 'cart.html'; 
        } else {
            alert('Có lỗi xảy ra khi xử lý mua ngay.');
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupQtyValidation();
    loadProductDetail();
});
