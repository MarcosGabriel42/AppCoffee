/* === Helpers === */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Esconder tab bar em login/cadastro
  const tabBar = document.getElementById("tab-bar-container");
  if (id === "login" || id === "signup") {
    tabBar.style.display = "none";
  } else {
    tabBar.style.display = "block";
  }
}

/* === Autenticação fake (apenas navegação) === */
function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Preencha email e senha para entrar (fake login).");
    return;
  }

  alert("Login fake bem-sucedido! 🚀");
  showPage("home");
}

function signup() {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!email || !password) {
    alert("Preencha email e senha para criar conta (fake signup).");
    return;
  }

  alert("Conta fake criada com sucesso! 🚀");
  showPage("login");
}

/* === Cafeterias fake === */
function loadCafeterias() {
  const fakeData = [
    { nome: "Café Central", endereco: "Rua A, 123", avaliacao: 4.5 },
    { nome: "Expresso 24h", endereco: "Av. B, 456", avaliacao: 4.0 },
    { nome: "Latte Lovers", endereco: "Praça C, 789", avaliacao: 5.0 },
  ];

  const list = document.getElementById("cafeteria-list");
  list.innerHTML = "";
  fakeData.forEach(cafe => {
    const div = document.createElement("div");
    div.className = 'cafeteria-card';
    div.innerHTML = `<h3>${cafe.nome}</h3><p>${cafe.endereco}</p><p>⭐ ${cafe.avaliacao}</p>`;
    div.onclick = () => showCafeteria(cafe);
    list.appendChild(div);
  });
}

function showCafeteria(cafe) {
  document.getElementById("cafeteria-nome").innerText = cafe.nome;
  document.getElementById("cafeteria-endereco").innerText = cafe.endereco;
  document.getElementById("cafeteria-avaliacoes").innerText = "Avaliação: " + cafe.avaliacao;
  showPage("cafeteria");
}

/* === Exportar para HTML === */
window.showPage = showPage;
window.login = login;
window.signup = signup;
window.loadCafeterias = loadCafeterias;
