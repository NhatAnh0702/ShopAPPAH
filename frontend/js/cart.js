async function loadCart() {
  const cartIds = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

  let total = 0;

  for (const id of cartIds) {
    const res = await fetch(`${API_URL}/products/${id}`);
    const p = await res.json();
    total += p.price;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <span>${p.name}</span>
        <span>${formatPrice(p.price)}</span>
      </div>
    `;
  }

  document.getElementById("cart-total").innerText = formatPrice(total);
}

document.addEventListener("DOMContentLoaded", loadCart);
