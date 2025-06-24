// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
  // Seleciona o elemento com a classe "catalogo" onde os cards dos filmes serão exibidos
  const catalogo = document.querySelector(".catalogo");

  // Lista completa de filmes disponíveis
  const filmes = [
    {
      id: 1,
      titulo: "The Shawshank Redemption",
      descricao: "Dois homens presos desenvolvem uma forte amizade, encontrando consolo e eventual redenção através de atos de decência comum.",
      imagem: "https://m.media-amazon.com/images/I/51NiGlapXlL._AC_.jpg",
      preco: 19.77
    },
    {
      id: 2,
      titulo: "The Godfather",
      descricao: "A história da poderosa família mafiosa Corleone e sua luta pelo poder e respeito.",
      imagem: "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      preco: 21.37
    },
    {
      id: 3,
      titulo: "The Dark Knight",
      descricao: "Batman enfrenta o Coringa, um criminoso caótico que leva Gotham à beira da anarquia.",
      imagem: "https://upload.wikimedia.org/wikipedia/pt/b/b7/TheDarkKnightRises.jpg",
      preco: 17.28
    },
    {
      id: 4,
      titulo: "Pulp Fiction",
      descricao: "Histórias interligadas de criminosos em Los Angeles, contadas de forma não linear.",
      imagem: "https://m.media-amazon.com/images/I/71c05lTE03L._AC_SY679_.jpg",
      preco: 13.51
    },
    {
      id: 5,
      titulo: "Forrest Gump",
      descricao: "A vida extraordinária de um homem simples que testemunha momentos históricos dos EUA.",
      imagem: "https://upload.wikimedia.org/wikipedia/pt/c/c0/ForrestGumpPoster.jpg",
      preco: 14.47
    },
    {
      id: 6,
      titulo: "Inception",
      descricao: "Um ladrão que invade sonhos é contratado para implantar uma ideia na mente de um CEO.",
      imagem: "https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_SY679_.jpg",
      preco: 16.90
    },
    {
      id: 7,
      titulo: "Fight Club",
      descricao: "Um homem insatisfeito forma um clube secreto de luta com um vendedor de sabão carismático.",
      imagem: "https://m.media-amazon.com/images/I/51v5ZpFyaFL._AC_.jpg",
      preco: 13.36
    },
    {
      id: 8,
      titulo: "The Matrix",
      descricao: "Um hacker descobre a verdade sobre sua realidade e seu papel na guerra contra seus controladores.",
      imagem: "https://m.media-amazon.com/images/I/51EG732BV3L._AC_.jpg",
      preco: 17.39
    },
    {
      id: 9,
      titulo: "The Lord of the Rings: The Fellowship of the Ring",
      descricao: "Um hobbit embarca em uma jornada para destruir um anel maligno e salvar a Terra Média.",
      imagem: "https://m.media-amazon.com/images/I/51Qvs9i5a%2BL._AC_.jpg",
      preco: 22.79
    },
    {
      id: 10,
      titulo: "Star Wars: Episode IV – A New Hope",
      descricao: "Luke Skywalker se junta à Rebelião para combater o Império e salvar a galáxia.",
      imagem: "https://m.media-amazon.com/images/I/81CIXJxQ3TL.jpg",
      preco: 20.25
    },
    {
      id: 11,
      titulo: "Titanic",
      descricao: "Um romance floresce a bordo do infame navio condenado.",
      imagem: "https://upload.wikimedia.org/wikipedia/pt/2/22/Titanic_poster.jpg",
      preco: 18.02
    },
    {
      id: 12,
      titulo: "Gladiator",
      descricao: "Um general romano é traído e busca vingança como gladiador.",
      imagem: "https://upload.wikimedia.org/wikipedia/pt/4/44/GladiadorPoster.jpg",
      preco: 13.64
    },
    {
      id: 13,
      titulo: "Jurassic Park",
      descricao: "Um parque de dinossauros clonados se transforma em um pesadelo.",
      imagem: "https://upload.wikimedia.org/wikipedia/pt/e/e7/Jurassic_Park_poster.jpg",
      preco: 15.76
    },
    {
      id: 14,
      titulo: "Interstellar",
      descricao: "Exploradores viajam através de um buraco de minhoca em busca de um novo lar para a humanidade.",
      imagem: "https://upload.wikimedia.org/wikipedia/pt/3/3a/Interstellar_Filme.png",
      preco: 17.52
    },
    {
      id: 15,
      titulo: "The Lion King",
      descricao: "Um jovem leão deve aceitar seu destino como rei após a morte de seu pai.",
      imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxwVFpaXDCVDDPbbSsZLYs-5XjBzA4ScEUAA&s",
      preco: 15.58
    },
    {
      id: 16,
      titulo: "Avengers: Endgame",
      descricao: "Os Vingadores se reúnem para desfazer o caos causado por Thanos.",
      imagem: "https://m.media-amazon.com/images/I/81ExhpBEbHL._AC_SY679_.jpg",
      preco: 20.21
    }
  ];

  // Para cada filme, cria um card e adiciona ao catálogo
  filmes.forEach(filme => {
    // Cria uma div para o card do filme
    const card = document.createElement("div");
    card.className = "card"; // Define a classe para aplicar o estilo

    // Define o conteúdo HTML do card com os dados do filme
    card.innerHTML = `
      <img src="${filme.imagem}" alt="${filme.titulo}">
      <h2>${filme.titulo}</h2>
      <p>${filme.descricao}</p>
      <p>Preço: R$ ${filme.preco.toFixed(2)}</p>
      <button>Adicionar ao Carrinho</button>
    `;

    // Adiciona um evento ao botão que chama a função para adicionar o filme ao carrinho
    card.querySelector("button").addEventListener("click", () => {
      adicionarCarrinho(filme);
    });

    // Adiciona o card criado ao elemento do catálogo na página
    catalogo.appendChild(card);
  });
});

// Função para adicionar filme ao carrinho no servidor (e não localStorage)
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
    await atualizarBadgeCarrinho(); // se você tiver esse badge no HTML
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
  } catch {}
}
