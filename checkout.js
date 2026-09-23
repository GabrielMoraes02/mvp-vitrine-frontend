const API_URL = window.VITRINE_CONFIG?.apiUrl || "http://localhost:8000/api";
const $ = selector => document.querySelector(selector);
const money = value => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escapeHtml = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

let cart = JSON.parse(localStorage.getItem("vitrine-cart") || "{}");
const user = JSON.parse(localStorage.getItem("vitrine-user") || "null");
let checkoutEntries = [];

if (!user) window.location.replace(`login.html?next=${encodeURIComponent("checkout.html")}`);

async function loadCheckout() {
  const response = await fetch(`${API_URL}/products?active=true&page_size=100&sort=rating`);
  if (!response.ok) throw new Error("Não foi possível carregar seu pedido.");
  const products = (await response.json()).items;
  const entries = Object.entries(cart).map(([id, quantity]) => ({ product: products.find(item => item.id === Number(id)), quantity })).filter(item => item.product && item.quantity > 0);
  checkoutEntries = entries;
  if (!entries.length) {
    $("#checkoutContent").classList.add("hidden"); $("#checkoutEmpty").classList.remove("hidden"); return;
  }
  $("#customerName").textContent = user.name;
  $("#customerEmail").textContent = user.email;
  $("#checkoutItems").innerHTML = entries.map(({ product, quantity }) => `<article class="checkout-item"><img src="${escapeHtml(product.image)}" alt="" /><div><strong>${escapeHtml(product.title)}</strong><small>Quantidade: ${quantity}</small></div><b>${money(product.price * quantity)}</b></article>`).join("");
  const total = entries.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  $("#checkoutSubtotal").textContent = money(total); $("#checkoutTotal").textContent = money(total);
}

function selectedPayment() { return document.querySelector('input[name="payment"]:checked').value; }
function updatePayment() {
  const card = selectedPayment() === "card";
  document.querySelectorAll(".payment-option").forEach(option => option.classList.toggle("active", option.querySelector("input").checked));
  $("#cardFields").classList.toggle("hidden", !card);
  $("#cardFields").querySelectorAll("input").forEach(input => { input.required = card; });
}

document.querySelectorAll('input[name="payment"]').forEach(input => input.addEventListener("change", updatePayment));
$("#postalCode").addEventListener("input", event => { event.target.value = event.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2"); });
$("#cardNumber").addEventListener("input", event => { event.target.value = event.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim(); });
$("#cardExpiry").addEventListener("input", event => { event.target.value = event.target.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2"); });
$("#checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();
  $("#checkoutError").classList.add("hidden");
  const button = $("#finishOrder"); button.disabled = true; button.textContent = "Processando pedido...";
  const address = [$("#address").value, $("#addressNumber").value, $("#addressExtra").value, $("#district").value, $("#city").value, $("#stateField").value, `CEP ${$("#postalCode").value}`].filter(Boolean).join(", ");
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: user.name,
        customer_email: user.email,
        payment_method: selectedPayment(),
        shipping_address: address,
        items: checkoutEntries.map(({ product, quantity }) => ({ product_id: product.id, quantity }))
      })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || "Não foi possível confirmar o pedido.");
    }
    const order = await response.json();
    localStorage.setItem("vitrine-cart", "{}");
    $("#checkoutContent").classList.add("hidden"); $(".checkout-steps").classList.add("hidden"); $("#orderSuccess").classList.remove("hidden");
    $("#orderNumber").textContent = `#${order.order_number}`; window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    $("#checkoutError").textContent = error.message; $("#checkoutError").classList.remove("hidden");
    button.disabled = false; button.innerHTML = "Confirmar pedido <span>→</span>";
  }
});

if (user) {
  loadCheckout().catch(error => { $("#checkoutContent").innerHTML = `<div class="checkout-empty"><h1>Não foi possível abrir o pedido</h1><p>${escapeHtml(error.message)}</p><a class="primary-auth-button" href="index.html">Voltar para a loja</a></div>`; });
}
