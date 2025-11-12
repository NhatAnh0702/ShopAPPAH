async function loadProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const res = await fetch(`${API_URL}/products/${id}`);
  const p = await res.json();

  document.getElementById("product-detail").innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <h2>${p.name}</h2>
    <p>${p.description}</p>
    <h3>Giá: ${formatPrice(p.price)}</h3>
    <button onclick="addToCart('${p._id}')">Thêm vào giỏ</button>
  `;
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("✅ Đã thêm vào giỏ hàng!");
}

document.addEventListener("DOMContentLoaded", loadProductDetail);
