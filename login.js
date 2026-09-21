const $ = selector => document.querySelector(selector);
const nextPage = new URLSearchParams(window.location.search).get("next") || "index.html";
let mode = "login";

function storedUser() {
  try { return JSON.parse(localStorage.getItem("vitrine-user") || "null"); }
  catch (_) { return null; }
}

function showToast(message) {
  $("#toast").textContent = message; $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2600);
}

function renderUser() {
  const user = storedUser();
  $("#loggedArea").classList.toggle("hidden", !user);
  $("#authArea").classList.toggle("hidden", !!user);
  if (!user) return;
  $("#loggedAvatar").textContent = user.name.charAt(0).toUpperCase();
  $("#loggedName").textContent = `Olá, ${user.name.split(" ")[0]}!`;
  $("#loggedEmail").textContent = user.email;
  $("#continueButton").href = nextPage;
  $("#continueButton").textContent = nextPage.includes("checkout") ? "Continuar para o pagamento" : "Continuar comprando";
}

function setMode(nextMode) {
  mode = nextMode;
  document.querySelectorAll("[data-auth-mode]").forEach(button => button.classList.toggle("active", button.dataset.authMode === mode));
  const registering = mode === "register";
  $("#nameField").classList.toggle("hidden", !registering);
  $("#authName").required = registering;
  $("#authTitle").textContent = registering ? "Crie sua conta" : "Entre na sua conta";
  $("#authDescription").textContent = registering ? "É rápido e você já pode finalizar sua compra." : "Use seus dados para continuar a compra.";
  $("#authSubmit").textContent = registering ? "Criar conta e continuar" : "Entrar e continuar";
  $("#authPassword").autocomplete = registering ? "new-password" : "current-password";
}

document.querySelectorAll("[data-auth-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.authMode)));
$("#authForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = $("#authEmail").value.trim().toLowerCase();
  const name = mode === "register" ? $("#authName").value.trim() : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
  localStorage.setItem("vitrine-user", JSON.stringify({ name, email, createdAt: new Date().toISOString() }));
  showToast(mode === "register" ? "Conta criada com sucesso" : "Login realizado com sucesso");
  setTimeout(() => { window.location.href = nextPage; }, 450);
});
$("#forgotPassword").addEventListener("click", () => showToast("Enviaremos as instruções na versão final"));
$("#logoutButton").addEventListener("click", () => { localStorage.removeItem("vitrine-user"); renderUser(); showToast("Você saiu da conta"); });

renderUser();
