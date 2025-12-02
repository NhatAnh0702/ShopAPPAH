// Biến lưu thông tin sản phẩm hiện tại
let currentProduct = null;

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const productDetailEl = document.getElementById('product-detail');
const loadingEl = document.getElementById('loading');
const qtyInput = document.getElementById('p-qty');

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
    
    loadingEl.style.display = 'none';
    productDetailEl.style.display = 'flex';
}

function changeQty(amount) {
    let currentQty = parseInt(qtyInput.value);
    currentQty += amount;
    if (currentQty < 1) currentQty = 1;
    qtyInput.value = currentQty;
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

    const quantity = parseInt(qtyInput.value);

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

    const quantity = parseInt(qtyInput.value);
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

document.addEventListener("DOMContentLoaded", loadProductDetail);
