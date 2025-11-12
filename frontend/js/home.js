async function loadProducts() {
  const res = await fetch(`${API_URL}/products`);
  const products = await res.json();

  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach(p => {
    const item = document.createElement("div");
    item.className = "product";
    item.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${formatPrice(p.price)}</p>
      <button onclick="viewProduct('${p._id}')">Xem chi tiết</button>
    `;
    list.appendChild(item);
  });
}

function viewProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadProducts);
