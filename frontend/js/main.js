// frontend/js/main.js
// Định nghĩa Base URL cho API Backend (mặc định tương ứng với backend trên port 5000)
const API_BASE_URL = 'http://localhost:5000/api';

// Hàm định dạng giá tiền (Dùng chung cho cả home và admin)
function formatPrice(v) {
    if (v == null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

// Hàm Escape HTML (Dùng chung cho cả home và admin)
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}

// Kiểm tra auth và hiển thị thông tin người dùng ở header
function checkAuth() {
    const token = localStorage.getItem('token');
    const userInfoEl = document.querySelector('.user-info');
    if (!userInfoEl) return;
    if (!token) {
        userInfoEl.innerHTML = `<a href="login.html">Đăng nhập</a>`;
    } else {
        const userName = localStorage.getItem('userName');
        const displayName = userName ? `${escapeHtml(userName)}` : 'Tài khoản';
        const userRole = localStorage.getItem('userRole');
        let adminLink = '';
        if (userRole === 'admin') adminLink = ` <a href="admin.html">Admin</a> | `;
        userInfoEl.innerHTML = `${adminLink}<a href="profile.html">${displayName}</a> | <a href="#" onclick="logout()">Logout</a>`;
    }
}

function goToCart(e) {
    if (e && e.preventDefault) e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        sessionStorage.setItem('redirectAfterLogin', 'cart.html');
        window.location.href = 'login.html';
        return;
    }
    window.location.href = 'cart.html';
}

function updateCartCount() {
    // Try to get cart count from server when user is logged in. Fallback to localStorage cart.
    (async () => {
        let totalCount = 0;
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await fetch(`${API_BASE_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    const items = data.cart || [];
                    totalCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
                }
            } catch (err) {
                console.warn('Không thể lấy cart từ server, dùng localStorage nếu có', err);
            }
        }

        if (!token) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }

        const countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.innerText = `(${totalCount})`;
        }
    })();
}

function doSearch() {
    const input = document.getElementById('header-search');
    const q = input ? input.value.trim() : '';
    const target = q ? `index.html?search=${encodeURIComponent(q)}` : 'index.html';
    window.location.href = target;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateCartCount();
});