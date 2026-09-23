const API_URL = window.VITRINE_CONFIG?.apiUrl || "http://localhost:8000/api";
const state = { products: [], categories: [], subcategories: [], report: null, deleteTarget: null };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = value => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) {
    let message = "Não foi possível concluir a operação.";
    try { message = (await response.json()).detail || message; } catch (_) { /* sem JSON */ }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

async function loadAll() {
  try {
    const [products, summary, categories, subcategories, report] = await Promise.all([
      api("/products?page_size=100&sort=newest"), api("/dashboard"), api("/categories"), api("/subcategories"), api(`/reports/sales?days=${$("#reportPeriod").value}`)
    ]);
    state.products = products.items;
    state.categories = categories;
    state.subcategories = subcategories;
    state.report = report;
    renderMetrics(summary);
    renderDashboard(summary);
    renderProducts();
    renderTaxonomy();
    fillCategorySelects();
    renderFinance(report);
  } catch (error) { showToast(error.message); }
}

function paymentLabel(method) {
  return ({ card: "Cartão", pix: "Pix", boleto: "Boleto" })[method] || method;
}

function renderFinance(report) {
  $("#financeRevenue").textContent = money(report.total_revenue);
  $("#financeExpenses").textContent = money(report.total_expenses);
  $("#financeBalance").textContent = money(report.net_balance);
  $("#financeBalance").classList.toggle("negative", report.net_balance < 0);
  $("#financeTicket").textContent = money(report.average_ticket);
  $("#financeOrders").textContent = `${report.orders_count} ${report.orders_count === 1 ? "pedido" : "pedidos"}`;
  $("#financeItems").textContent = `${report.items_sold} ${report.items_sold === 1 ? "item vendido" : "itens vendidos"}`;
  $("#salesPeriodLabel").textContent = `${report.days} dias`;

  const maxRevenue = Math.max(...report.sales_by_day.map(item => item.revenue), 1);
  $("#salesChart").innerHTML = report.sales_by_day.length ? report.sales_by_day.map(item => {
    const date = new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `<div class="sales-bar-column" title="${date}: ${money(item.revenue)}"><strong>${money(item.revenue)}</strong><div><span style="height:${Math.max(10, item.revenue / maxRevenue * 100)}%"></span></div><small>${date}</small></div>`;
  }).join("") : `<div class="finance-empty">As vendas aparecerão aqui depois do primeiro pedido.</div>`;

  const paymentTotal = Math.max(report.orders_count, 1);
  $("#paymentBreakdown").innerHTML = report.payment_methods.length ? report.payment_methods.map(item => `
    <div class="payment-row"><div><span class="payment-symbol">${item.method === "pix" ? "◆" : item.method === "card" ? "▣" : "▤"}</span><div><strong>${paymentLabel(item.method)}</strong><small>${item.orders} pedidos • ${money(item.revenue)}</small></div></div><span>${Math.round(item.orders / paymentTotal * 100)}%</span></div>`).join("") : `<div class="finance-empty">Nenhum pagamento no período.</div>`;

  $("#topProducts").innerHTML = report.top_products.length ? report.top_products.map((item, index) => `
    <div class="top-product-row"><span>${index + 1}</span><div><strong>${escapeHtml(item.title)}</strong><small>${item.quantity} vendidos</small></div><b>${money(item.revenue)}</b></div>`).join("") : `<div class="finance-empty">Nenhum produto vendido no período.</div>`;

  $("#expenseList").innerHTML = report.expenses.length ? report.expenses.map(item => `
    <div class="expense-row"><div><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(item.category)} • ${new Date(`${item.expense_date}T12:00:00`).toLocaleDateString("pt-BR")}</small></div><b>− ${money(item.amount)}</b><button type="button" data-delete-expense="${item.id}" aria-label="Excluir despesa">×</button></div>`).join("") : `<div class="finance-empty">Nenhuma despesa registrada no período.</div>`;

  $("#recentOrdersTable").innerHTML = report.recent_orders.map(order => `
    <tr><td><strong>#${escapeHtml(order.order_number)}</strong></td><td>${escapeHtml(order.customer_name)}</td><td>${new Date(order.created_at).toLocaleDateString("pt-BR")}</td><td>${paymentLabel(order.payment_method)}</td><td><span class="status-badge active">Pago</span></td><td><strong>${money(order.total)}</strong></td></tr>`).join("");
  $("#ordersEmpty").classList.toggle("hidden", !!report.recent_orders.length);
}

function openExpenseForm() {
  $("#expenseForm").reset(); $("#expenseError").classList.add("hidden");
  $("#expenseDate").value = new Date().toISOString().slice(0, 10);
  $("#expenseDialog").showModal();
}

async function saveExpense(event) {
  event.preventDefault();
  const payload = { description: $("#expenseDescription").value.trim(), category: $("#expenseCategory").value, amount: Number($("#expenseAmount").value), expense_date: $("#expenseDate").value };
  try { await api("/expenses", { method: "POST", body: JSON.stringify(payload) }); $("#expenseDialog").close(); showToast("Despesa registrada"); await loadAll(); }
  catch (error) { showFormError("#expenseError", error.message); }
}

async function deleteExpense(id) {
  try { await api(`/expenses/${id}`, { method: "DELETE" }); showToast("Despesa excluída"); await loadAll(); }
  catch (error) { showToast(error.message); }
}

function renderMetrics(summary) {
  $("#metricTotal").textContent = summary.total_products;
  $("#metricActive").textContent = summary.active_products;
  $("#metricLowStock").textContent = summary.low_stock_products;
  $("#metricAverage").textContent = money(summary.average_price);
}

function renderDashboard(summary) {
  const categoryEntries = Object.entries(summary.products_by_category).sort((a, b) => b[1] - a[1]);
  const maximum = Math.max(...categoryEntries.map(([, count]) => count), 1);
  $("#dashboardCategoryTotal").textContent = `${categoryEntries.length} ${categoryEntries.length === 1 ? "categoria" : "categorias"}`;
  $("#categoryChart").innerHTML = categoryEntries.length ? categoryEntries.map(([name, count]) => `
    <div class="chart-row"><div class="chart-label"><span>${escapeHtml(name)}</span><strong>${count}</strong></div><div class="chart-track"><span style="width:${Math.max(8, count / maximum * 100)}%"></span></div></div>`).join("") : `<div class="dashboard-empty">Sincronize produtos para visualizar a distribuição.</div>`;

  const lowStock = state.products.filter(product => product.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5);
  $("#stockAlertList").innerHTML = lowStock.length ? lowStock.map(product => `
    <div class="stock-alert-item"><img src="${escapeHtml(product.image)}" alt="" /><div><strong>${escapeHtml(product.title)}</strong><small>${escapeHtml(categoryById(product.category_id)?.name || product.category)}</small></div><span>${product.stock} un.</span></div>`).join("") : `<div class="dashboard-success">✓ Nenhum produto com estoque baixo.</div>`;

  $("#recentProducts").innerHTML = state.products.slice(0, 5).map(product => `
    <div class="recent-product-item"><img src="${escapeHtml(product.image)}" alt="" /><div><strong>${escapeHtml(product.title)}</strong><small>${money(product.price)} • ${product.source === "fake_store" ? "Importado" : "Local"}</small></div><span class="status-dot"></span></div>`).join("");
}

function categoryById(id) { return state.categories.find(item => item.id === Number(id)); }
function subcategoryById(id) { return state.subcategories.find(item => item.id === Number(id)); }
function productById(id) { return state.products.find(item => item.id === Number(id)); }

function renderProducts() {
  const query = normalize($("#adminSearch").value);
  const products = state.products.filter(product => normalize(product.title).includes(query));
  $("#adminCount").textContent = `${products.length} ${products.length === 1 ? "produto" : "produtos"}`;
  $(".table-wrap").classList.toggle("hidden", !products.length);
  $("#adminEmpty").classList.toggle("hidden", !!products.length);
  $("#adminTable").innerHTML = products.map(product => {
    const category = categoryById(product.category_id)?.name || product.category;
    const subcategory = subcategoryById(product.subcategory_id)?.name || "Sem subcategoria";
    return `<tr>
      <td><div class="table-product"><img src="${escapeHtml(product.image)}" alt="" /><div><strong>${escapeHtml(product.title)}</strong><small>ID ${product.id}</small></div></div></td>
      <td><div class="classification"><strong>${escapeHtml(category)}</strong><small>${escapeHtml(subcategory)}</small></div></td>
      <td><span class="source-badge ${product.source}">${product.source === "fake_store" ? "Importado" : "Local"}</span></td>
      <td><strong>${money(product.price)}</strong></td><td><span class="stock-badge ${product.stock <= 5 ? "low" : ""}">${product.stock} un.</span></td>
      <td><span class="status-badge ${product.active ? "active" : "inactive"}">${product.active ? "Ativo" : "Inativo"}</span></td>
      <td><div class="row-actions"><button type="button" data-edit-product="${product.id}">✎</button><button class="delete-action" type="button" data-delete-product="${product.id}">⌫</button></div></td>
    </tr>`;
  }).join("");
}

function renderTaxonomy() {
  $("#categoryCount").textContent = `${state.categories.length} ${state.categories.length === 1 ? "categoria" : "categorias"}`;
  $("#categoryList").innerHTML = state.categories.length ? state.categories.map(category => `
    <div class="taxonomy-item"><div class="taxonomy-icon">${escapeHtml(category.name.charAt(0).toUpperCase())}</div><div class="taxonomy-copy"><strong>${escapeHtml(category.name)}</strong><small>${category.product_count} produtos • ${category.subcategory_count} subcategorias</small></div><div class="row-actions"><button data-edit-category="${category.id}" type="button">✎</button><button class="delete-action" data-delete-category="${category.id}" type="button">⌫</button></div></div>`).join("") : `<div class="taxonomy-empty">Nenhuma categoria cadastrada.</div>`;

  const filter = Number($("#subcategoryFilter").value || 0);
  const subcategories = state.subcategories.filter(item => !filter || item.category_id === filter);
  $("#subcategoryCount").textContent = `${subcategories.length} ${subcategories.length === 1 ? "subcategoria" : "subcategorias"}`;
  $("#subcategoryList").innerHTML = subcategories.length ? subcategories.map(subcategory => `
    <div class="taxonomy-item"><div class="taxonomy-icon sub">↳</div><div class="taxonomy-copy"><strong>${escapeHtml(subcategory.name)}</strong><small>${escapeHtml(subcategory.category_name)} • ${subcategory.product_count} produtos</small></div><div class="row-actions"><button data-edit-subcategory="${subcategory.id}" type="button">✎</button><button class="delete-action" data-delete-subcategory="${subcategory.id}" type="button">⌫</button></div></div>`).join("") : `<div class="taxonomy-empty">Nenhuma subcategoria encontrada.</div>`;
}

function fillCategorySelects(selectedCategory = "", selectedSubcategory = "") {
  const options = state.categories.map(item => `<option value="${item.id}" ${Number(selectedCategory) === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
  $("#productCategory").innerHTML = `<option value="">Selecione uma categoria</option>${options}`;
  $("#subcategoryCategory").innerHTML = `<option value="">Selecione uma categoria</option>${options}`;
  $("#subcategoryFilter").innerHTML = `<option value="">Todas as categorias</option>${options}`;
  fillSubcategorySelect(selectedCategory, selectedSubcategory);
}

function fillSubcategorySelect(categoryId, selected = "") {
  const items = state.subcategories.filter(item => item.category_id === Number(categoryId));
  $("#productSubcategory").innerHTML = `<option value="">Sem subcategoria</option>${items.map(item => `<option value="${item.id}" ${Number(selected) === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}`;
}

function openProductForm(product = null) {
  $("#productForm").reset(); $("#formError").classList.add("hidden");
  $("#productId").value = product?.id || "";
  $("#formEyebrow").textContent = product ? "EDITAR ITEM" : "NOVO ITEM";
  $("#formTitle").textContent = product ? "Editar produto" : "Cadastrar produto";
  fillCategorySelects(product?.category_id || "", product?.subcategory_id || "");
  if (product) {
    $("#productTitle").value = product.title; $("#productPrice").value = product.price; $("#productStock").value = product.stock;
    $("#productActive").value = String(product.active); $("#productImage").value = product.image; $("#productDescription").value = product.description;
  } else { $("#productStock").value = 10; $("#productActive").value = "true"; }
  $("#productFormDialog").showModal();
}

async function saveProduct(event) {
  event.preventDefault();
  const id = $("#productId").value;
  const category = categoryById($("#productCategory").value);
  if (!category) return showFormError("#formError", "Selecione uma categoria.");
  const payload = {
    title: $("#productTitle").value.trim(), description: $("#productDescription").value.trim(), price: Number($("#productPrice").value),
    category: category.name, category_id: category.id, subcategory_id: Number($("#productSubcategory").value) || null,
    image: $("#productImage").value.trim(), stock: Number($("#productStock").value), active: $("#productActive").value === "true"
  };
  try {
    await api(id ? `/products/${id}` : "/products", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    $("#productFormDialog").close(); showToast(id ? "Produto atualizado" : "Produto cadastrado"); await loadAll();
  } catch (error) { showFormError("#formError", error.message); }
}

function openCategoryForm(category = null) {
  $("#categoryForm").reset(); $("#categoryError").classList.add("hidden");
  $("#categoryId").value = category?.id || ""; $("#categoryName").value = category?.name || "";
  $("#categoryFormTitle").textContent = category ? "Editar categoria" : "Nova categoria";
  $("#categoryDialog").showModal();
}

async function saveCategory(event) {
  event.preventDefault(); const id = $("#categoryId").value;
  try {
    await api(id ? `/categories/${id}` : "/categories", { method: id ? "PATCH" : "POST", body: JSON.stringify({ name: $("#categoryName").value.trim() }) });
    $("#categoryDialog").close(); showToast(id ? "Categoria atualizada" : "Categoria criada"); await loadAll();
  } catch (error) { showFormError("#categoryError", error.message); }
}

function openSubcategoryForm(subcategory = null) {
  $("#subcategoryForm").reset(); $("#subcategoryError").classList.add("hidden");
  $("#subcategoryId").value = subcategory?.id || ""; $("#subcategoryName").value = subcategory?.name || "";
  $("#subcategoryFormTitle").textContent = subcategory ? "Editar subcategoria" : "Nova subcategoria";
  const options = state.categories.map(item => `<option value="${item.id}" ${subcategory?.category_id === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
  $("#subcategoryCategory").innerHTML = `<option value="">Selecione uma categoria</option>${options}`;
  $("#subcategoryDialog").showModal();
}

async function saveSubcategory(event) {
  event.preventDefault(); const id = $("#subcategoryId").value;
  const payload = { name: $("#subcategoryName").value.trim(), category_id: Number($("#subcategoryCategory").value) };
  try {
    await api(id ? `/subcategories/${id}` : "/subcategories", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    $("#subcategoryDialog").close(); showToast(id ? "Subcategoria atualizada" : "Subcategoria criada"); await loadAll();
  } catch (error) { showFormError("#subcategoryError", error.message); }
}

function requestDelete(type, id, name) {
  state.deleteTarget = { type, id };
  $("#deleteTitle").textContent = `Excluir ${type === "product" ? "produto" : type === "category" ? "categoria" : "subcategoria"}?`;
  $("#deleteMessage").textContent = `“${name}” será removido. Itens vinculados impedem a exclusão de categorias e subcategorias.`;
  $("#deleteDialog").showModal();
}

async function confirmDelete() {
  const target = state.deleteTarget; if (!target) return;
  const paths = { product: "products", category: "categories", subcategory: "subcategories" };
  try { await api(`/${paths[target.type]}/${target.id}`, { method: "DELETE" }); showToast("Item excluído"); await loadAll(); }
  catch (error) { showToast(error.message); }
  finally { state.deleteTarget = null; }
}

async function syncProducts() {
  const buttons = [$("#syncProducts"), $("#dashboardSync")].filter(Boolean); buttons.forEach(button => { button.disabled = true; button.textContent = "Sincronizando..."; });
  try { const result = await api("/products/sync", { method: "POST" }); showToast(`${result.imported} importados e ${result.updated} atualizados`); await loadAll(); }
  catch (error) { showToast(error.message); }
  finally { buttons.forEach((button, index) => { button.disabled = false; button.textContent = index === 0 ? "↻ Sincronizar produtos" : "Sincronizar agora"; }); }
}

function showFormError(selector, message) { $(selector).textContent = message; $(selector).classList.remove("hidden"); }
let toastTimer;
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2800); }

$$('[data-admin-tab]').forEach(button => button.addEventListener("click", () => {
  $$('[data-admin-tab]').forEach(item => item.classList.toggle("active", item === button));
  $("#dashboardView").classList.toggle("hidden", button.dataset.adminTab !== "dashboard");
  $("#productsView").classList.toggle("hidden", button.dataset.adminTab !== "products");
  $("#categoriesView").classList.toggle("hidden", button.dataset.adminTab !== "categories");
  $("#financeView").classList.toggle("hidden", button.dataset.adminTab !== "finance");
  $("#newProduct").classList.toggle("hidden", button.dataset.adminTab !== "products");
}));
function goToProducts() { document.querySelector('[data-admin-tab="products"]').click(); }
$$('[data-go-products]').forEach(button => button.addEventListener("click", goToProducts));
$("#adminSearch").addEventListener("input", renderProducts);
$("#newProduct").addEventListener("click", () => openProductForm());
$("#syncProducts").addEventListener("click", syncProducts);
$("#dashboardSync").addEventListener("click", syncProducts);
$("#emptySync").addEventListener("click", syncProducts);
$("#productCategory").addEventListener("change", event => fillSubcategorySelect(event.target.value));
$("#productForm").addEventListener("submit", saveProduct);
$("#categoryForm").addEventListener("submit", saveCategory);
$("#subcategoryForm").addEventListener("submit", saveSubcategory);
$("#newCategory").addEventListener("click", () => openCategoryForm());
$("#newSubcategory").addEventListener("click", () => openSubcategoryForm());
$("#subcategoryFilter").addEventListener("change", renderTaxonomy);
$("#reportPeriod").addEventListener("change", loadAll);
$("#newExpense").addEventListener("click", openExpenseForm);
$("#expenseShortcut").addEventListener("click", openExpenseForm);
$("#expenseForm").addEventListener("submit", saveExpense);
$("#expenseList").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-expense]");
  if (button) deleteExpense(Number(button.dataset.deleteExpense));
});
$("#adminTable").addEventListener("click", event => {
  const edit = event.target.closest("[data-edit-product]"); const remove = event.target.closest("[data-delete-product]");
  if (edit) openProductForm(productById(edit.dataset.editProduct));
  if (remove) { const product = productById(remove.dataset.deleteProduct); requestDelete("product", product.id, product.title); }
});
$("#categoryList").addEventListener("click", event => {
  const edit = event.target.closest("[data-edit-category]"); const remove = event.target.closest("[data-delete-category]");
  if (edit) openCategoryForm(categoryById(edit.dataset.editCategory));
  if (remove) { const item = categoryById(remove.dataset.deleteCategory); requestDelete("category", item.id, item.name); }
});
$("#subcategoryList").addEventListener("click", event => {
  const edit = event.target.closest("[data-edit-subcategory]"); const remove = event.target.closest("[data-delete-subcategory]");
  if (edit) openSubcategoryForm(subcategoryById(edit.dataset.editSubcategory));
  if (remove) { const item = subcategoryById(remove.dataset.deleteSubcategory); requestDelete("subcategory", item.id, item.name); }
});
$$('[data-close]').forEach(button => button.addEventListener("click", () => $(`#${button.dataset.close}`).close()));
$("#confirmDelete").addEventListener("click", confirmDelete);

loadAll();
