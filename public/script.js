document.addEventListener("DOMContentLoaded", () => {
  carregarCatalogo();
  atualizarBadgeCarrinho();
});

async function carregarCatalogo() {
  const catalogo = document.querySelector(".catalogo");

  try {
    const resp = await fetch('/api/filmes');
    if (!resp.ok) throw new Error('Falha ao carregar filmes do servidor');

    const filmes = await resp.json();
    catalogo.innerHTML = '';

    filmes.forEach(filme => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${filme.imagem}" alt="${filme.titulo}">
        <h2>${filme.titulo}</h2>
        <p>${filme.descricao}</p>
        <p>Preço: R$ ${filme.preco.toFixed(2)}</p>
        <button>Adicionar ao Carrinho</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        adicionarCarrinho(filme);
      });

      catalogo.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao carregar catálogo:', error);
    catalogo.innerHTML = '<p>Erro ao carregar filmes. Tente novamente mais tarde.</p>';
  }
}

async function adicionarCarrinho(filme) {
  try {
    const resp = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filme)
    });

    if (resp.status === 401) {
      alert('Você precisa estar logado para adicionar ao carrinho.');
      window.location.href = '/login/login.html';
      return;
    }

    if (!resp.ok) {
      alert('Erro ao adicionar ao carrinho.');
      return;
    }

    alert('Filme adicionado ao carrinho!');
    await atualizarBadgeCarrinho();

  } catch (err) {
    console.error('Erro ao adicionar filme:', err);
    alert('Erro de rede ao adicionar filme.');
  }
}

async function atualizarBadgeCarrinho() {
  const spanBadge = document.getElementById('badge-carrinho');
  if (!spanBadge) return;

  try {
    const resp = await fetch('/api/cart');
    if (!resp.ok) return;

    const data = await resp.json();
    const count = Array.isArray(data.itens) ? data.itens.length : 0;
    spanBadge.textContent = count;

  } catch {
    // erro silencioso
  }
}
