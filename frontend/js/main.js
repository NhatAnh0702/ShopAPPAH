const API_URL = "http://localhost:3000/api";

function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    document.querySelector(".user-info").innerHTML = `<a href="login.html">Đăng nhập</a>`;
  } else {
    document.querySelector(".user-info").innerHTML = `<a href="profile.html">Tài khoản</a>`;
  }
}

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "đ";
}

document.addEventListener("DOMContentLoaded", checkAuth);
