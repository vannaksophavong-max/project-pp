let cart = [];

function updateCartUI() {
  document.querySelector(".cart-btn").innerText = "Cart (" + cart.length + ")";
}

function calculateTotal() {
  let total = 0;
  cart.forEach(i => total += i.price);
  return total;
}

function goCheckout() {
  if (cart.length === 0) {
    alert("Cart empty");
    return;
  }
  localStorage.setItem("total", calculateTotal());
  window.location.href = "checkout.html";
}

/* ── PRODUCT DETAIL MODAL ── */
function createModal() {
  if (document.getElementById("productModal")) return;

  const overlay = document.createElement("div");
  overlay.id = "productModal";

  overlay.innerHTML = `
    <div>
      <div style="position:relative;">
        <img id="modalImg">
        <button onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div id="modalName"></div>
          <div id="modalPrice"></div>
        </div>
        <div id="modalType"></div>
        <p id="modalDesc"></p>
        <div class="modal-qty-row">
          <span>ចំនួន:</span>
          <button class="qty-btn" onclick="changeQty(-1)">−</button>
          <span id="modalQty">1</span>
          <button class="qty-btn" onclick="changeQty(1)">+</button>
          <span id="modalTotal"></span>
        </div>
        <div class="modal-btn-row">
          <button class="modal-btn-add" onclick="modalAddCart()">🛒 Add to Cart</button>
          <button class="modal-btn-buy" onclick="modalBuyNow()">⚡ Buy Now</button>
        </div>
      </div>
    </div>
  `;

  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}

let currentProduct = null;
let currentQty = 1;

function openDetail(product) {
  createModal();
  currentProduct = product;
  currentQty = 1;
  document.getElementById("modalImg").src = product.img;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").textContent = "$" + product.price;
  document.getElementById("modalType").textContent = product.type === "blind" ? "🎁 Blind Box" : "🌸 Block Paradise";
  document.getElementById("modalDesc").textContent = product.type === "blind"
    ? "Mystery Blind Box — មិនដឹងថាទទួលបានអ្វីទេ! 🎁"
    : "Block សម្រាប់តុបតែង ឬ ប្រមូល — ស្អាត ល្អ សម្រាប់គ្រប់វ័យ! 🌸";
  document.getElementById("modalQty").textContent = 1;
  document.getElementById("modalTotal").textContent = "= $" + product.price;
  document.getElementById("productModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const m = document.getElementById("productModal");
  if (m) { m.style.display = "none"; document.body.style.overflow = ""; }
}

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById("modalQty").textContent = currentQty;
  document.getElementById("modalTotal").textContent = "= $" + (currentProduct.price * currentQty).toFixed(2);
}

function modalAddCart() {
  for (let i = 0; i < currentQty; i++) cart.push(currentProduct);
  updateCartUI();
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("total", calculateTotal());
  closeModal();
}

function modalBuyNow() {
  for (let i = 0; i < currentQty; i++) cart.push(currentProduct);
  updateCartUI();
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("total", calculateTotal());
  window.location.href = "card.html";
}

/* ── DATA ── */

async function loadProducts() {
  try {
    const API = "https://block-paradise-backend.onrender.com/api/v1";
    const url = `${API}/products?limit=100`;

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error(`Product fetch failed (${response.status}):`, text || response.statusText);
      return;
    }

    const data = await response.json();
    const products = data.products || [];

    const normalizeCategory = (value) => String(value || '').trim().toLowerCase();
    const blockProducts = products
      .filter(p => (p.is_active === true || p.is_active === 'true' || p.is_active === 1) && normalizeCategory(p.category) === "block")
      .map(p => ({ name: p.name, price: p.price, img: p.image_url, type: "block" }));

    const blindProducts = products
      .filter(p => (p.is_active === true || p.is_active === 'true' || p.is_active === 1) && normalizeCategory(p.category) === "blind")
      .map(p => ({ name: p.name, price: p.price, img: p.image_url, type: "blind" }));

    render(blockProducts, "blockList");
    render(blindProducts, "blindList");
  } catch (error) {
    console.error("Failed to load products:", error);
  }
}

/* ── RENDER ── */
function render(list, id) {
  const box = document.getElementById(id);
  box.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="image" style="cursor:pointer;"><img src="${p.img}"></div>
      <div class="name" style="cursor:pointer;">${p.name}</div>
      <div class="price">$${p.price}</div>
      <div class="btn-row">
        <button class="btn-add">Add</button>
        <button class="btn-buy">Buy</button>
      </div>
    `;

    card.querySelector(".image").onclick = () => openDetail(p);
    card.querySelector(".name").onclick = () => openDetail(p);

    card.querySelector(".btn-add").onclick = (e) => {
      e.stopPropagation();
      cart.push(p);
      updateCartUI();
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("total", calculateTotal());
    };

    card.querySelector(".btn-buy").onclick = (e) => {
      e.stopPropagation();
      cart.push(p);
      updateCartUI();
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("total", calculateTotal());
      window.location.href = "card.html";
    };

    box.appendChild(card);
  });
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

loadProducts();