// app.js (module)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://atnvcyesjeutfooghpqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bnZjeWVzamV1dGZvb2docHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzA0OTgsImV4cCI6MjA3MzIwNjQ5OH0.u9QfIc1V3IH0gQme26OFAGwvVCqqAyAui7cSABuaiys';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* === Helpers === */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  const tabBar = document.getElementById('tab-bar-container');
  if (tabBar) tabBar.style.display = (id === 'login' || id === 'signup') ? 'none' : 'block';
}

/* === Estado do usuário (perfil) === */
let usuario = null;

/* === Funções de Autenticação === */
async function signup() {
  const nome = document.getElementById('signup-nome').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const senha = document.getElementById('signup-senha').value;
  const confirmar = document.getElementById('signup-confirmar-senha').value;

  if (!nome || !email || !senha || !confirmar) { alert('Preencha todos os campos!'); return; }
  if (senha !== confirmar) { alert('As senhas não coincidem!'); return; }

  const { data: signData, error: signError } = await supabase.auth.signUp({ email, password: senha });
  if (signError) { alert('Erro ao criar conta: ' + signError.message); return; }

  const userId = signData?.user?.id ?? null;

  let fotoURL = null;
  const fotoInput = document.getElementById('perfil-foto-input');
  if (fotoInput && fotoInput.files[0]) {
    const file = fotoInput.files[0];
    const ext = file.name.split('.').pop();
    const fileName = `${userId ?? email}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('perfil-fotos').upload(fileName, file, { upsert: true });
    if (uploadErr) { console.warn('Erro upload:', uploadErr); }
    else { const { data } = supabase.storage.from('perfil-fotos').getPublicUrl(fileName); fotoURL = data.publicUrl; }
  }

  const payload = userId ? { id: userId, nome, email, foto: fotoURL } : { nome, email, foto: fotoURL };
  const { error: insertErr } = await supabase.from('users').insert([payload]);
  if (insertErr) { alert('Conta criada no Auth, mas houve erro ao salvar perfil: ' + insertErr.message); showPage('login'); return; }

  alert('Conta criada com sucesso! Verifique seu email.');
  showPage('login');
}

async function login() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-password').value;

  if (!email || !senha) { alert('Preencha email e senha!'); return; }

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (loginError) { alert('Erro ao logar: ' + loginError.message); return; }

  const userId = loginData?.user?.id;
  const { data: profile, error: profileError } = await supabase.from('users').select('*').eq('id', userId).single();
  if (profileError) { usuario = { id: userId, email }; }
  else { usuario = profile; }

  carregarPerfil();
  showPage('home');
  alert('Login realizado! 🚀');
}

/* === Carregar perfil na UI === */
function carregarPerfil() {
  if (!usuario) return;
  const nomeEl = document.getElementById('perfil-nome-display');
  const fotoEl = document.getElementById('perfil-foto');
  if (nomeEl) nomeEl.innerText = usuario.nome || usuario.email || 'Usuário';
  if (fotoEl) fotoEl.src = usuario.foto || 'Asstes/user.jpg';
}

/* === Editar perfil === */
async function salvarEdicao() {
  if (!usuario) { alert('Nenhum usuário logado'); return; }

  const novoNome = document.getElementById('editar-nome').value.trim();
  const novaSenha = document.getElementById('editar-senha').value;
  const confirmar = document.getElementById('editar-confirmar-senha')?.value;

  if (!novoNome) { alert('O nome não pode ficar vazio'); return; }
  if (novaSenha && novaSenha !== confirmar) { alert('As senhas não coincidem'); return; }

  if (novaSenha) {
    const { error: pwErr } = await supabase.auth.updateUser({ password: novaSenha });
    if (pwErr) { alert('Erro ao atualizar senha: ' + pwErr.message); return; }
  }

  const fotoInput = document.getElementById('editar-foto-input');
  let fotoURL = usuario.foto;
  if (fotoInput && fotoInput.files[0]) {
    const file = fotoInput.files[0];
    const ext = file.name.split('.').pop();
    const fileName = `${usuario.id ?? usuario.email}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('perfil-fotos').upload(fileName, file, { upsert: true });
    if (uploadErr) { console.warn('Erro upload foto:', uploadErr); }
    else { const { data } = supabase.storage.from('perfil-fotos').getPublicUrl(fileName); fotoURL = data.publicUrl; }
  }

  const { error: updErr } = await supabase.from('users').update({ nome: novoNome, foto: fotoURL }).eq('id', usuario.id);
  if (updErr) { alert('Erro ao atualizar perfil: ' + updErr.message); return; }

  usuario.nome = novoNome;
  usuario.foto = fotoURL;
  carregarPerfil();
  alert('Perfil atualizado! 😊');
  showPage('perfil');
}

/* === Logout / Excluir conta === */
async function sairConta() {
  await supabase.auth.signOut();
  usuario = null;
  showPage('login');
  alert('Você saiu da conta 👋');
}

async function excluirConta() {
  if (!confirm('Deseja realmente excluir sua conta?')) return;
  if (!usuario || !usuario.id) { alert('Usuário não identificado'); return; }
  const { error } = await supabase.from('users').delete().eq('id', usuario.id);
  if (error) { alert('Erro ao excluir conta: ' + error.message); return; }
  usuario = null;
  alert('Conta excluída (perfil). 👋');
  showPage('login');
}

/* === Cafeterias (CRUD básico) === */
let selectedRating = 0;

function bindStarRating() {
  document.querySelectorAll('#star-rating .star').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      document.querySelectorAll('#star-rating .star').forEach(s => s.classList.remove('selected'));
      for (let i = 1; i <= selectedRating; i++) {
        const s = document.querySelector(`#star-rating .star[data-value="${i}"]`);
        if (s) s.classList.add('selected');
      }
    });
  });
}

async function loadCafeterias() {
  const { data, error } = await supabase.from('cafeterias').select('*').order('id');
  const list = document.getElementById('cafeteria-list');
  list.innerHTML = '';
  if (error) { list.innerHTML = `<p>Erro: ${error.message}</p>`; return; }
  if (!data || data.length === 0) { list.innerHTML = '<p>Nenhuma cafeteria adicionada ainda.</p>'; return; }

  data.forEach(cafe => {
    const div = document.createElement('div');
    div.className = 'cafeteria-card';
    div.innerHTML = `<h3>${cafe.nome}</h3><p>${cafe.endereco}</p><p>⭐ ${cafe.avaliacao}</p>`;
    div.onclick = () => showCafeteria(cafe);
    list.appendChild(div);
  });
}

function showCafeteria(cafe) {
  document.getElementById('cafeteria-nome').innerText = cafe.nome;
  document.getElementById('cafeteria-endereco').innerText = cafe.endereco;
  document.getElementById('cafeteria-avaliacoes').innerText = 'Avaliação: ' + cafe.avaliacao;
  document.getElementById('cafeteria-detalhes').innerHTML = `<button class="btn-excluir" onclick="excluirCafeteria(${cafe.id})">Excluir Cafeteria</button>`;
  showPage('cafeteria');
}

async function excluirCafeteria(id) {
  if (!confirm('Tem certeza que deseja excluir esta cafeteria?')) return;
  const { error } = await supabase.from('cafeterias').delete().eq('id', id);
  if (error) { alert('Erro ao excluir: ' + error.message); return; }
  alert('Cafeteria excluída! ☕');
  loadCafeterias();
  showPage('cafeterias');
}

async function addCafeteria() {
  const nome = document.getElementById('new-nome').value.trim();
  const endereco = document.getElementById('new-endereco').value.trim();
  if (!nome || !endereco || selectedRating === 0) { alert('Preencha todos os campos e selecione avalição'); return; }
  const { error } = await supabase.from('cafeterias').insert([{ nome, endereco, avaliacao: selectedRating }]);
  if (error) { alert('Erro ao adicionar: ' + error.message); return; }
  alert('Cafeteria adicionada! ☕');
  loadCafeterias();
  showPage('cafeterias');
}

/* === Ranking de Cafeterias (com filtros) === */
async function loadRanking() {
  const filtro = document.getElementById('ranking-filtro')?.value || 'avaliacao-desc';
  let orderBy = 'avaliacao';
  let orderDir = 'desc';

  switch(filtro) {
    case 'avaliacao-desc': orderBy = 'avaliacao'; orderDir = 'desc'; break;
    case 'avaliacao-asc': orderBy = 'avaliacao'; orderDir = 'asc'; break;
    case 'date-desc': orderBy = 'created_at'; orderDir = 'desc'; break;
    case 'date-asc': orderBy = 'created_at'; orderDir = 'asc'; break;
  }

  const { data, error } = await supabase.from('cafeterias').select('*').order(orderBy, { ascending: orderDir === 'asc' });
  const container = document.getElementById('ranking-list');
  container.innerHTML = '';

  if (error) { container.innerHTML = `<p>Erro: ${error.message}</p>`; return; }
  if (!data || data.length === 0) { container.innerHTML = '<p>Nenhuma cafeteria cadastrada ainda.</p>'; return; }

  data.forEach(cafe => {
    const div = document.createElement('div');
    div.className = 'ranking-card';
    div.innerHTML = `
      <h3>${cafe.nome}</h3>
      <p>${cafe.endereco}</p>
      <p>⭐ ${cafe.avaliacao}</p>
      <p>Criado em: ${new Date(cafe.created_at).toLocaleDateString()}</p>
    `;
    container.appendChild(div);
  });
}

/* === Previews de foto (signup / edit) === */
function bindPhotoPreviews() {
  const p1 = document.getElementById('perfil-foto-input');
  const preview1 = document.getElementById('perfil-foto-input-preview');
  if (p1 && preview1) { p1.addEventListener('change', () => { const f = p1.files[0]; if (f) { const reader = new FileReader(); reader.onload = () => preview1.src = reader.result; reader.readAsDataURL(f); } }); }

  const p2 = document.getElementById('editar-foto-input');
  const preview2 = document.getElementById('editar-foto-preview');
  if (p2 && preview2) { p2.addEventListener('change', () => { const f = p2.files[0]; if (f) { const reader = new FileReader(); reader.onload = () => preview2.src = reader.result; reader.readAsDataURL(f); } }); }
}

/* === Inicialização (binds) === */
document.addEventListener('DOMContentLoaded', () => {
  bindStarRating();
  bindPhotoPreviews();
  loadRanking(); // ranking inicial
  supabase.auth.getSession().then(({ data }) => {
    const session = data.session;
    if (session?.user?.id) {
      supabase.from('users').select('*').eq('id', session.user.id).single()
        .then(({ data: profile }) => { if (profile) { usuario = profile; carregarPerfil(); showPage('home'); } })
        .catch(()=>{});
    }
  }).catch(()=>{});
});

/* === Tornar funções acessíveis no HTML (onclick) === */
window.showPage = showPage;
window.login = login;
window.signup = signup;
window.carregarPerfil = carregarPerfil;
window.salvarEdicao = salvarEdicao;
window.excluirConta = excluirConta;
window.sairConta = sairConta;
window.loadCafeterias = loadCafeterias;
window.addCafeteria = addCafeteria;
window.showCafeteria = showCafeteria;
window.excluirCafeteria = excluirCafeteria;
window.loadRanking = loadRanking;
