// frontend/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const msg = document.getElementById('login-message');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    function showLogin() {
        document.getElementById('login-section').style.display = '';
        document.getElementById('register-section').style.display = 'none';
        msg.innerText = '';
    }

    function showRegister() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = '';
        msg.innerText = '';
    }

    tabLogin && tabLogin.addEventListener('click', showLogin);
    tabRegister && tabRegister.addEventListener('click', showRegister);

    // Login handler
    loginForm && loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.innerText = '';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            msg.innerText = 'Vui lòng nhập email và mật khẩu.';
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    if (data.user && data.user.name) localStorage.setItem('userName', data.user.name);
                    if (data.user && data.user.email) localStorage.setItem('userEmail', data.user.email);
                    if (data.user && data.user.role) localStorage.setItem('userRole', data.user.role);
                    const redirect = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirect;
                    return;
                }
            } else {
                const err = await res.json().catch(()=>({message:'Lỗi đăng nhập'}));
                msg.innerText = err.message || 'Đăng nhập thất bại';
                return;
            }
        } catch (err) {
            console.warn('Login API not available, using demo fallback', err);
        }

        // Demo fallback
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('token', demoToken);
        const namePart = email.split('@')[0] || email;
        localStorage.setItem('userName', namePart);
        const redirect = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirect;
    });

    // Register handler
    registerForm && registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.innerText = '';

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('r-email').value.trim();
        const password = document.getElementById('r-password').value.trim();
        const password2 = document.getElementById('r-password2').value.trim();

        if (!name || !email || !password) {
            msg.innerText = 'Vui lòng điền đầy đủ thông tin.';
            return;
        }
        if (password !== password2) {
            msg.innerText = 'Mật khẩu nhập lại không khớp.';
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    if (data.user && data.user.name) localStorage.setItem('userName', data.user.name);
                    if (data.user && data.user.email) localStorage.setItem('userEmail', data.user.email);
                    if (data.user && data.user.role) localStorage.setItem('userRole', data.user.role);
                    const redirect = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirect;
                    return;
                }
            } else {
                const err = await res.json().catch(()=>({message:'Đăng ký thất bại'}));
                msg.innerText = err.message || 'Đăng ký thất bại';
                return;
            }
        } catch (err) {
            console.error('Register error', err);
            msg.innerText = 'Lỗi kết nối đến server.';
            return;
        }
    });
});
