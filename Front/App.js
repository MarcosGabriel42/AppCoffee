/* === Helpers === */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Mostrar/ocultar tab bar
  const tabBar = document.getElementById("tab-bar-container");
  tabBar.style.display = (id === "login" || id === "signup") ? "none" : "block";
}

/* === Login fake === */
function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) {
    alert("Preencha email e senha!");
    return;
  }
  usuario.email = email;
  alert("Login fake bem-sucedido! 🚀");
  showPage("home");
  carregarPerfil();
}

/* === Cadastro / Perfil === */
let usuario = { nome: "", email: "", senha: "", foto: "https://via.placeholder.com/100" };

function signup() {
  const nome = document.getElementById("signup-nome").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const senha = document.getElementById("signup-senha").value.trim();

  const fotoInput = document.getElementById("perfil-foto-input");
  if (fotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      usuario.foto = reader.result;
      finalizarCadastro(nome, email, senha);
    };
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    finalizarCadastro(nome, email, senha);
  }
}

function finalizarCadastro(nome, email, senha) {
  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }
  usuario.nome = nome;
  usuario.email = email;
  usuario.senha = senha;
  alert("Conta criada com sucesso! 🚀");
  showPage("home");
  carregarPerfil();
}

function carregarPerfil() {
  document.getElementById("perfil-nome").value = usuario.nome;
  document.getElementById("perfil-email").value = usuario.email;
  document.getElementById("perfil-senha").value = usuario.senha;
  document.getElementById("perfil-foto-edit").src = usuario.foto;
}

function editarPerfil() {
  const novoNome = document.getElementById("perfil-nome").value.trim();
  const novaSenha = document.getElementById("perfil-senha").value.trim();
  if (!novoNome || !novaSenha) { alert("Nome e senha não podem estar vazios!"); return; }
  usuario.nome = novoNome;
  usuario.senha = novaSenha;

  const fotoInput = document.getElementById("perfil-foto-input-edit");
  if (fotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      usuario.foto = reader.result;
      document.getElementById("perfil-foto-edit").src = usuario.foto;
      alert("Perfil atualizado! 😊");
    };
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    alert("Perfil atualizado! 😊");
  }
}

function sairConta() {
  alert("Você saiu da conta 👋");
  showPage("login");
}

function excluirConta() {
  if (confirm("Deseja realmente excluir sua conta?")) {
    usuario = { nome: "", email: "", senha: "", foto: "https://via.placeholder.com/100" };
    alert("Conta excluída 👋");
    showPage("login");
  }
}

/* === Cafeterias fake === */
let cafes = [
  { id: 1, nome: "Café Central", endereco: "Rua A, 123", avaliacao: 4 },
  { id: 2, nome: "Expresso 24h", endereco: "Av. B, 456", avaliacao: 4 },
  { id: 3, nome: "Latte Lovers", endereco: "Praça C, 789", avaliacao: 5 },
];

// Renderiza lista de cafeterias
function loadCafeterias() {
  const list = document.getElementById("cafeteria-list");
  list.innerHTML = "";
  if (!cafes.length) { list.innerHTML = "<p>Nenhuma cafeteria adicionada ainda.</p>"; return; }
  cafes.forEach(cafe => {
    const div = document.createElement("div");
    div.className = 'cafeteria-card';
    div.innerHTML = `<h3>${cafe.nome}</h3><p>${cafe.endereco}</p><p>⭐ ${cafe.avaliacao}</p>`;
    div.onclick = () => showCafeteria(cafe);
    list.appendChild(div);
  });
}

// Mostra detalhes da cafeteria
function showCafeteria(cafe) {
  document.getElementById("cafeteria-nome").innerText = cafe.nome;
  document.getElementById("cafeteria-endereco").innerText = cafe.endereco;
  document.getElementById("cafeteria-avaliacoes").innerText = "Avaliação: " + cafe.avaliacao;
  document.getElementById("cafeteria-detalhes").innerHTML = `
    <button class="btn-excluir" onclick="excluirCafeteria(${cafe.id})">Excluir Cafeteria</button>
  `;
  showPage("cafeteria");
}

function excluirCafeteria(id) {
  if (confirm("Tem certeza que deseja excluir esta cafeteria?")) {
    cafes = cafes.filter(c => c.id !== id);
    alert("Cafeteria excluída! ☕");
    loadCafeterias();
    showPage("cafeterias");
  }
}

/* === Adicionar Cafeteria === */
let selectedRating = 0;

document.querySelectorAll("#star-rating .star")?.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.getAttribute("data-value"));
    document.querySelectorAll("#star-rating .star").forEach(s => s.classList.remove("selected"));
    for (let i = 1; i <= selectedRating; i++) {
      document.querySelector(`#star-rating .star[data-value="${i}"]`).classList.add("selected");
    }
  });
});

function addCafeteria() {
  const nome = document.getElementById("new-nome").value.trim();
  const endereco = document.getElementById("new-endereco").value.trim();

  if (!nome || !endereco || selectedRating === 0) {
    alert("Preencha todos os campos e selecione uma avaliação!");
    return;
  }

  const novaId = cafes.length ? Math.max(...cafes.map(c => c.id)) + 1 : 1;
  cafes.push({ id: novaId, nome, endereco, avaliacao: selectedRating });
  alert("Cafeteria adicionada! ☕");
  loadCafeterias();
  showPage("cafeterias");
}

/* === Exportar para HTML === */
window.showPage = showPage;
window.login = login;
window.signup = signup;
window.carregarPerfil = carregarPerfil;
window.editarPerfil = editarPerfil;
window.excluirConta = excluirConta;
window.sairConta = sairConta;
window.loadCafeterias = loadCafeterias;
window.showCafeteria = showCafeteria;
window.excluirCafeteria = excluirCafeteria;
window.addCafeteria = addCafeteria;
