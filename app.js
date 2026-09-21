const API_URL = window.VITRINE_CONFIG?.apiUrl || "http://localhost:8000/api";
const categoryLabels = {
  all: "Todos",
  electronics: "Eletrônicos",
  jewelery: "Joias",
  "men's clothing": "Masculino",
  "women's clothing": "Feminino"
};

const state = {
  products: [],
  adminProducts: [],
  category: "all",
  query: "",
  sort: "featured",
  favoritesOnly: false,
  favorites: JSON.parse(localStorage.getItem("vitrine-favorites") || "[]"),
  cart: JSON.parse(localStorage.getItem("vitrine-cart") || "{}"),
  budget: Number(localStorage.getItem("vitrine-budget") || 600),
  deleteId: null
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const formatMoney = value => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const categoryName = category => categoryLabels[category] || category;

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    let message = "Não foi possível concluir a operação.";
    try { message = (await response.json()).detail || message; } catch (_) { /* resposta sem JSON */ }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

function saveLocalState() {
  localStorage.setItem("vitrine-favorites", JSON.stringify(state.favorites));
  localStorage.setItem("vitrine-cart", JSON.stringify(state.cart));
  localStorage.setItem("vitrine-budget", String(state.budget));
}

async function loadStore({ syncWhenEmpty = true } = {}) {
  $("#loadingState").classList.remove("hidden");
  $("#productGrid").classList.add("hidden");
  $("#emptyState").classList.add("hidden");
  try {
    let result = await api("/products?active=true&page_size=100&sort=rating");
    if (result.total === 0 && syncWhenEmpty) {
      showToast("Preparando o catálogo pela primeira vez...");
      await api("/products/sync", { method: "POST" });
      result = await api("/products?active=true&page_size=100&sort=rating");
    }
    state.products = result.items;
    renderCategories();
    renderProducts();
    renderCart();
  } catch (error) {
    renderConnectionError(error.message);
  } finally {
    $("#loadingState").classList.add("hidden");
  }
}

function renderConnectionError(message) {
  $("#resultCount").textContent = "API indisponível";
  $("#emptyState").classList.remove("hidden");
  $("#emptyState").innerHTML = `
    <span>!</span><h3>Não foi possível carregar a loja</h3>
    <p>${message} Verifique se a API está rodando na porta 8000.</p>
    <button type="button" id="retryConnection">Tentar novamente</button>`;
  $("#retryConnection").addEventListener("click", () => loadStore());
}

function renderCategories() {
  const categories = ["all", ...new Set(state.products.map(product => product.category))];
  $("#categoryTabs").innerHTML = categories.map(category => `
    <button type="button" role="tab" class="${state.category === category ? "active" : ""}" data-category="${escapeHtml(category)}">
      ${escapeHtml(categoryName(category))}
    </button>`).join("");
}

function getVisibleProducts() {
  let list = state.products.filter(product => {
    const matchesCategory = state.category === "all" || product.category === state.category;
    const matchesSearch = normalize(product.title).includes(normalize(state.query));
    const matchesFavorites = !state.favoritesOnly || state.favorites.includes(product.id);
    return matchesCategory && matchesSearch && matchesFavorites;
  });
  if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  return list;
}

function renderProducts() {
  const products = getVisibleProducts();
  $("#resultCount").textContent = `${products.length} ${products.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
  $("#productGrid").classList.toggle("hidden", !products.length);
  $("#emptyState").classList.toggle("hidden", !!products.length);
  if (!products.length) {
    $("#emptyState").innerHTML = `<span>⌕</span><h3>Nenhum produto encontrado</h3><p>Tente outra busca ou categoria.</p><button type="button" id="clearFilters">Limpar filtros</button>`;
    $("#clearFilters").addEventListener("click", clearFilters);
  }
  $("#productGrid").innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image" data-details="${product.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${escapeHtml(product.title)}">
        <button type="button" class="favorite ${state.favorites.includes(product.id) ? "active" : ""}" data-favorite="${product.id}" aria-label="Favoritar">${state.favorites.includes(product.id) ? "♥" : "♡"}</button>
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" />
      </div>
      <div class="product-body">
        <span class="product-category">${escapeHtml(categoryName(product.category))}</span>
        <h3>${escapeHtml(product.title)}</h3>
        <div class="rating">★ ${Number(product.rating).toFixed(1)} <span>(${product.rating_count})</span></div>
        <div class="product-footer"><strong class="product-price">${formatMoney(product.price)}</strong><button type="button" class="add-button" data-add="${product.id}" ${product.stock === 0 ? "disabled" : ""}>${product.stock === 0 ? "Sem estoque" : "Adicionar"}</button></div>
      </div>
    </article>`).join("");
  $("#favoriteCount").textContent = state.favorites.length;
}

function clearFilters() {
  state.category = "all";
  state.query = "";
  state.favoritesOnly = false;
  $("#searchInput").value = "";
  renderCategories();
  renderProducts();
}

function productById(id) {
  return state.products.find(product => product.id === Number(id)) || state.adminProducts.find(product => product.id === Number(id));
}

function cartEntries() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({ product: productById(id), quantity }))
    .filter(item => item.product);
}

function renderCart() {
  const entries = cartEntries();
  const count = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  $("#cartCount").textContent = count;
  $("#cartItems").innerHTML = entries.map(({ product, quantity }) => `
    <article class="cart-item">
      <img src="${escapeHtml(product.image)}" alt="" />
      <div><h4>${escapeHtml(product.title)}</h4><span class="cart-item-price">${formatMoney(product.price)}</span>
        <div class="quantity"><button type="button" data-decrease="${product.id}">−</button><strong>${quantity}</strong><button type="button" data-increase="${product.id}" ${quantity >= product.stock ? "disabled" : ""}>+</button></div>
      </div>
      <button type="button" class="remove-item" data-remove="${product.id}" aria-label="Remover produto">×</button>
    </article>`).join("");
  $("#cartEmpty").classList.toggle("hidden", !!entries.length);
  $("#cartItems").classList.toggle("hidden", !entries.length);
  $("#cartSummary").classList.toggle("hidden", !entries.length);
  $("#subtotal").textContent = formatMoney(total);
  $("#total").textContent = formatMoney(total);
  const percent = Math.round(total / state.budget * 100);
  $("#budgetPercent").textContent = `${percent}%`;
  $("#budgetStatus").textContent = percent <= 100 ? "da sua meta" : "acima da sua meta";
  $("#budgetProgress").style.width = `${Math.min(percent, 100)}%`;
  $("#budgetProgress").style.background = percent > 100 ? "#ff654f" : "#159b72";
  $("#budgetCaption").textContent = `Meta de ${formatMoney(state.budget)}`;
  saveLocalState();
}

function addToCart(id) {
  const product = productById(id);
  if (!product || product.stock === 0) return;
  if ((state.cart[id] || 0) >= product.stock) return showToast("Quantidade máxima em estoque atingida");
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderCart();
  showToast("Produto adicionado ao carrinho");
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites, id];
  saveLocalState();
  renderProducts();
  showToast(state.favorites.includes(id) ? "Adicionado aos favoritos" : "Removido dos favoritos");
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showProduct(id) {
  const product = productById(id);
  if (!product) return;
  $("#dialogContent").innerHTML = `<div class="dialog-product">
    <div class="dialog-product-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" /></div>
    <div><span class="product-category">${escapeHtml(categoryName(product.category))}</span><h2>${escapeHtml(product.title)}</h2>
      <div class="rating">★ ${Number(product.rating).toFixed(1)} <span>(${product.rating_count} avaliações)</span></div>
      <p>${escapeHtml(product.description)}</p><strong class="product-price">${formatMoney(product.price)}</strong>
      <button type="button" class="add-button" data-dialog-add="${product.id}" ${product.stock === 0 ? "disabled" : ""}>${product.stock === 0 ? "Sem estoque" : "Adicionar ao carrinho"}</button>
    </div></div>`;
  $("#productDialog").showModal();
}

async function openAdmin() {
  closeCart();
  $$('[data-store-section]').forEach(section => section.classList.add("hidden"));
  $("#adminPanel").classList.remove("hidden");
  $("#openCart").classList.add("hidden");
  $("#adminMobile")?.classList.add("hidden");
  $(".search").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  await loadAdmin();
}

function closeAdmin() {
  $("#adminPanel").classList.add("hidden");
  $$('[data-store-section]').forEach(section => section.classList.remove("hidden"));
  $("#openCart").classList.remove("hidden");
  $("#adminMobile")?.classList.remove("hidden");
  $(".search").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  loadStore({ syncWhenEmpty: false });
}

async function loadAdmin() {
  try {
    const [products, summary] = await Promise.all([
      api("/products?page_size=100&sort=newest"),
      api("/dashboard")
    ]);
    state.adminProducts = products.items;
    renderAdminProducts();
    $("#metricTotal").textContent = summary.total_products;
    $("#metricActive").textContent = summary.active_products;
    $("#metricLowStock").textContent = summary.low_stock_products;
    $("#metricAverage").textContent = formatMoney(summary.average_price);
  } catch (error) {
    showToast(error.message);
  }
}

function renderAdminProducts() {
  const query = normalize($("#adminSearch").value);
  const products = state.adminProducts.filter(product => normalize(product.title).includes(query));
  $("#adminCount").textContent = `${products.length} ${products.length === 1 ? "produto" : "produtos"}`;
  $(".table-wrap").classList.toggle("hidden", !products.length);
  $("#adminEmpty").classList.toggle("hidden", !!products.length);
  $("#adminTable").innerHTML = products.map(product => `
    <tr>
      <td><div class="table-product"><img src="${escapeHtml(product.image)}" alt="" /><div><strong>${escapeHtml(product.title)}</strong><small>${escapeHtml(categoryName(product.category))}</small></div></div></td>
      <td><span class="source-badge ${product.source}">${product.source === "fake_store" ? "Fake Store" : "Local"}</span></td>
      <td><strong>${formatMoney(product.price)}</strong></td>
      <td><span class="stock-badge ${product.stock <= 5 ? "low" : ""}">${product.stock} un.</span></td>
      <td><span class="status-badge ${product.active ? "active" : "inactive"}">${product.active ? "Ativo" : "Inativo"}</span></td>
      <td><div class="row-actions"><button type="button" data-edit="${product.id}" aria-label="Editar">✎</button><button class="delete-action" type="button" data-delete="${product.id}" aria-label="Excluir">⌫</button></div></td>
    </tr>`).join("");
}

function openProductForm(product = null) {
  $("#productForm").reset();
  $("#formError").classList.add("hidden");
  $("#productId").value = product?.id || "";
  $("#formEyebrow").textContent = product ? "EDITAR ITEM" : "NOVO ITEM";
  $("#formTitle").textContent = product ? "Editar produto" : "Cadastrar produto";
  if (product) {
    $("#productTitle").value = product.title;
    $("#productCategory").value = product.category;
    $("#productPrice").value = product.price;
    $("#productStock").value = product.stock;
    $("#productActive").value = String(product.active);
    $("#productImage").value = product.image;
    $("#productDescription").value = product.description;
  } else {
    $("#productStock").value = 10;
    $("#productActive").value = "true";
  }
  $("#productFormDialog").showModal();
}

async function saveProduct(event) {
  event.preventDefault();
  const id = $("#productId").value;
  const payload = {
    title: $("#productTitle").value.trim(),
    category: $("#productCategory").value.trim(),
    price: Number($("#productPrice").value),
    stock: Number($("#productStock").value),
    active: $("#productActive").value === "true",
    image: $("#productImage").value.trim(),
    description: $("#productDescription").value.trim()
  };
  const button = $("#saveProduct");
  button.disabled = true;
  button.textContent = "Salvando...";
  try {
    await api(id ? `/products/${id}` : "/products", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    $("#productFormDialog").close();
    showToast(id ? "Produto atualizado" : "Produto cadastrado");
    await loadAdmin();
  } catch (error) {
    $("#formError").textContent = error.message;
    $("#formError").classList.remove("hidden");
  } finally {
    button.disabled = false;
    button.textContent = "Salvar produto";
  }
}

async function syncProducts() {
  const buttons = [$("#syncProducts"), $("#emptySync")].filter(Boolean);
  buttons.forEach(button => { button.disabled = true; button.dataset.original = button.textContent; button.textContent = "Sincronizando..."; });
  try {
    const result = await api("/products/sync", { method: "POST" });
    showToast(`${result.imported} importados e ${result.updated} atualizados`);
    await loadAdmin();
  } catch (error) {
    showToast(error.message);
  } finally {
    buttons.forEach(button => { button.disabled = false; button.textContent = button.dataset.original; });
  }
}

async function deleteProduct() {
  const id = state.deleteId;
  if (!id) return;
  try {
    await api(`/products/${id}`, { method: "DELETE" });
    delete state.cart[id];
    state.favorites = state.favorites.filter(item => item !== id);
    saveLocalState();
    showToast("Produto excluído");
    await loadAdmin();
  } catch (error) {
    showToast(error.message);
  } finally {
    state.deleteId = null;
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

$("#categoryTabs").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  state.favoritesOnly = false;
  renderCategories(); renderProducts();
});
$("#productGrid").addEventListener("click", event => {
  const favorite = event.target.closest("[data-favorite]");
  const add = event.target.closest("[data-add]");
  const details = event.target.closest("[data-details]");
  if (favorite) { event.stopPropagation(); toggleFavorite(Number(favorite.dataset.favorite)); }
  else if (add) addToCart(Number(add.dataset.add));
  else if (details) showProduct(Number(details.dataset.details));
});
$("#searchInput").addEventListener("input", event => { state.query = event.target.value; renderProducts(); });
$("#sortSelect").addEventListener("change", event => { state.sort = event.target.value; renderProducts(); });
$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#closeDialog").addEventListener("click", () => $("#productDialog").close());
$("#dialogContent").addEventListener("click", event => {
  const add = event.target.closest("[data-dialog-add]");
  if (add) { addToCart(Number(add.dataset.dialogAdd)); $("#productDialog").close(); openCart(); }
});
$("#cartItems").addEventListener("click", event => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");
  if (increase) state.cart[increase.dataset.increase] += 1;
  if (decrease) { const id = decrease.dataset.decrease; state.cart[id] -= 1; if (state.cart[id] <= 0) delete state.cart[id]; }
  if (remove) { delete state.cart[remove.dataset.remove]; showToast("Produto removido"); }
  renderCart();
});
$("#favoritesButton").addEventListener("click", () => {
  state.favoritesOnly = !state.favoritesOnly; state.category = "all";
  renderCategories(); renderProducts(); document.querySelector("#produtos").scrollIntoView();
  showToast(state.favoritesOnly ? "Mostrando favoritos" : "Mostrando todos os produtos");
});
$("#editBudget").addEventListener("click", () => { $("#budgetInput").value = state.budget; $("#budgetDialog").showModal(); });
$("#saveBudget").addEventListener("click", event => {
  if (!$("#budgetInput").checkValidity()) return;
  event.preventDefault(); state.budget = Number($("#budgetInput").value); $("#budgetDialog").close(); renderCart(); showToast("Meta atualizada");
});
$("#checkoutButton").addEventListener("click", () => showToast("Compra simulada com sucesso!"));
$("#adminButton")?.addEventListener("click", openAdmin);
$("#adminMobile")?.addEventListener("click", openAdmin);
$("#exitAdmin").addEventListener("click", closeAdmin);
$("[data-store-link]").addEventListener("click", closeAdmin);
$("#newProduct").addEventListener("click", () => openProductForm());
$("#syncProducts").addEventListener("click", syncProducts);
$("#emptySync").addEventListener("click", syncProducts);
$("#adminSearch").addEventListener("input", renderAdminProducts);
$("#adminTable").addEventListener("click", event => {
  const edit = event.target.closest("[data-edit]");
  const remove = event.target.closest("[data-delete]");
  if (edit) openProductForm(productById(Number(edit.dataset.edit)));
  if (remove) { state.deleteId = Number(remove.dataset.delete); $("#deleteDialog").showModal(); }
});
$("#productForm").addEventListener("submit", saveProduct);
$("#closeProductForm").addEventListener("click", () => $("#productFormDialog").close());
$("#cancelProductForm").addEventListener("click", () => $("#productFormDialog").close());
$("#confirmDelete").addEventListener("click", deleteProduct);
document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#searchInput").focus(); }
  if (event.key === "Escape") closeCart();
});

loadStore();
