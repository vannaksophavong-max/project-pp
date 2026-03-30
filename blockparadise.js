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

/* DATA */
const blockProducts = [

  { name: "Flower Block 1", price: 8, img: "f1.jpg" },
  { name: "Flower Block 2", price: 8, img: "f2.jpg" },
  { name: "Flower Block 3", price: 8, img: "f3.jpg" },
  { name: "Flower Block 4", price: 8, img: "f4.jpg" },
  { name: "Flower Block 5", price: 9, img: "f5.jpg" },
  { name: "Flower Block 6", price: 9, img: "f6.jpg" },
  { name: "Flower Block 7", price: 8, img: "f7.jpg" },
  { name: "Flower Block 8", price: 8, img: "f8.jpg" },
  { name: "Flower Block 9", price: 8, img: "f9.jpg" },
  { name: "Flower Block 10", price: 8, img: "f10.jpg" },
  { name: "Flower Block 11", price: 9, img: "f11.jpg" },
  { name: "Flower Block 12", price: 9, img: "f12.jpg" }



];

/* BLIND BOX */
const blindProducts = [
  { name: "Blind Box 1", price: 12, img: "bb1.jpg" },
  { name: "Blind Box 2", price: 12, img: "bb2.jpg" },
  { name: "Blind Box 3", price: 8, img: "bb3.jpg" },
  { name: "Blind Box 4", price: 8, img: "bb4.jpg" },
  { name: "Blind Box 5", price: 12, img: "bb5.jpg" },
  { name: "Blind Box 6", price: 12, img: "bb6.jpg" },
  { name: "Blind Box 7", price: 8, img: "bb7.jpg" },
  { name: "Blind Box 8", price: 8, img: "bb8.jpg" },
  { name: "Blind Box 9", price: 12, img: "bb9.jpg" },
  { name: "Blind Box 10", price: 12, img: "bb10.jpg" },
  { name: "Blind Box 11", price: 8, img: "bb11.jpg" },
  { name: "Blind Box 12", price: 8, img: "bb12.jpg" }


];

/* RENDER */
function render(list, id) {

  const box = document.getElementById(id);
  box.innerHTML = "";

  list.forEach(p => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
<div class="image"><img src="${p.img}"></div>
<div>${p.name}</div>
<div>$${p.price}</div>

<div class="btn-row">
<button class="btn-add">Add</button>
<button class="btn-buy" >Buy</button>
</div>
`;

    const addBtn = card.querySelector(".btn-add");
    const buyBtn = card.querySelector(".btn-buy");

    addBtn.onclick = () => {
      cart.push(p);
      updateCartUI();
    };

    buyBtn.onclick = () => {
      localStorage.setItem("total", p.price);
      window.location.href = "card.html";
    };
    buyBtn.onclick = () => {
      // add to cart first
      cart.push(p);
      updateCartUI();

      // calculate total
      const total = calculateTotal();

      // save total
      localStorage.setItem("total", total);

      // go to payment page
      window.location.href = "card.html";
    };
    box.appendChild(card);

  });

}

render(blockProducts, "blockList");
render(blindProducts, "blindList");