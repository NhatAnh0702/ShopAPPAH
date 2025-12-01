// Biến lưu thông tin sản phẩm hiện tại
let currentProduct = null;

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const productDetailEl = document.getElementById('product-detail');
const loadingEl = document.getElementById('loading');
const qtyInput = document.getElementById('p-qty');

async function loadProductDetail() {
    if (!productId) {
        alert('Không tìm thấy ID sản phẩm!');
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

function isRequestLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Lưu lại URL hiện tại để sau khi login quay lại đúng trang này
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        
        if(confirm("Bạn cần đăng nhập để thực hiện chức năng này. Đi đến trang đăng nhập?")) {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}

async function handleAddToCart() {
    if (!isRequestLoggedIn()) return;

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
            alert('Đã thêm vào giỏ hàng thành công!');
        } else {
            alert(data.message || 'Lỗi khi thêm vào giỏ');
        }

    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối server');
    }
}

async function handleBuyNow() {
    if (!isRequestLoggedIn()) return;

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
