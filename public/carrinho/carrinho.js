// carrinho.js

// Ao carregar o DOM, verifica autenticação e configura listeners
document.addEventListener('DOMContentLoaded', () => {
  // Função de auth.js que verifica se usuário está logado e atualiza nav, exibe "Olá, usuário", etc.
  // Caso queira, pode retornar info do usuário ou simplesmente atualizar estado UI.
  if (typeof verificarUsuario === 'function') {
    verificarUsuario();
  }

  // Verifica se está autenticado e carrega o carrinho
  verificarAuthECarregaCarrinho();

  // Configura botão de limpar carrinho, se existir
  const botaoLimpar = document.getElementById('limpar-carrinho');
  if (botaoLimpar) {
    botaoLimpar.addEventListener('click', async () => {
      await limparCarrinhoServidor();
    });
  }

  // Configura botão de finalizar compra, se existir
  const botaoFinalizar = document.getElementById('finalizar-compra');
  if (botaoFinalizar) {
    botaoFinalizar.addEventListener('click', async () => {
      await finalizarCompra();
    });
  }
});

// Verifica se está autenticado; se sim, carrega o carrinho; se não, redireciona ou exibe aviso
async function verificarAuthECarregaCarrinho() {
  try {
    const respUser = await fetch('/api/user');
    if (respUser.ok) {
      const dataUser = await respUser.json();
      if (!dataUser.authenticated) {
        // Usuário não autenticado: avisa e redireciona para login
        alert('Por favor, faça login para acessar o carrinho.');
        window.location.href = '/login/login.html'; // ajuste o caminho conforme seu projeto
        return;
      }
      // Se quiser exibir nome/email no carrinho, pode usar dataUser aqui
    }
  } catch (err) {
    console.error('Erro ao verificar autenticação:', err);
    // Em caso de erro de rede, ainda tentamos carregar o carrinho; se API de carrinho retornar 401, tratamos abaixo
  }
  // Após verificação (ou em caso de erro de rede), tentamos carregar o carrinho
  await carregarCarrinhoDoServidor();
}

// Função para buscar o carrinho do servidor e renderizar
async function carregarCarrinhoDoServidor() {
  const conteudo = document.getElementById('conteudo-carrinho');
  if (!conteudo) {
    console.error('Elemento #conteudo-carrinho não encontrado no DOM.');
    return;
  }
  try {
    const resp = await fetch('/api/cart');
    if (resp.status === 401) {
      // Não está autenticado
      alert('Você precisa estar logado para ver o carrinho.');
      window.location.href = '/login/login.html';
      return;
    }
    if (!resp.ok) {
      console.error('Erro ao obter carrinho:', resp.statusText);
      // Exibe carrinho vazio ou mensagem de erro
      mostrarCarrinho([]);
      return;
    }
    const data = await resp.json();
    const carrinho = Array.isArray(data.itens) ? data.itens : [];
    mostrarCarrinho(carrinho);
  } catch (err) {
    console.error('Erro de rede ao obter carrinho:', err);
    mostrarCarrinho([]);
  }
}

// Função que renderiza itens no DOM
function mostrarCarrinho(carrinho) {
  const conteudo = document.getElementById('conteudo-carrinho');
  const botaoLimpar = document.getElementById('limpar-carrinho');
  const botaoFinalizar = document.getElementById('finalizar-compra');

  // Limpa conteúdo anterior
  conteudo.innerHTML = '';

  if (!Array.isArray(carrinho) || carrinho.length === 0) {
    // Carrinho vazio
    conteudo.innerHTML = `
      <div class="carrinho-vazio">
        <p><strong>🛒 Seu carrinho está vazio no momento.</strong></p>
        <p>Que tal dar uma olhada no nosso catálogo e escolher algo incrível?</p>
      </div>
    `;
    // Oculta botões de limpar e finalizar, se existirem
    if (botaoLimpar) botaoLimpar.style.display = 'none';
    if (botaoFinalizar) botaoFinalizar.style.display = 'none';
    return;
  }

  // Há itens, mostra botões
  if (botaoLimpar) botaoLimpar.style.display = '';
  if (botaoFinalizar) botaoFinalizar.style.display = '';

  let total = 0;

  // Para cada item, cria um card/linha
  carrinho.forEach(filme => {
    // Crie o layout de acordo com seu CSS. Exemplo genérico:
    const itemElem = document.createElement('div');
    itemElem.className = 'card-carrinho'; // ajuste classe conforme seu CSS

    // Imagem, título, descrição e preço
    // Supondo que filme.imagem seja URL ou caminho relativo válido
    itemElem.innerHTML = `
      <img src="${filme.imagem}" alt="${filme.titulo}" class="carrinho-img"/>
      <div class="carrinho-info">
        <h2>${filme.titulo}</h2>
        <p>${filme.descricao || ''}</p>
        <p><strong>Preço:</strong> R$ ${Number(filme.preco).toFixed(2)}</p>
      </div>
    `;
    // Botão remover
    const btnRemover = document.createElement('button');
    btnRemover.textContent = 'Remover';
    btnRemover.className = 'btn-remover-carrinho'; // ajuste classe conforme seu CSS
    btnRemover.addEventListener('click', async () => {
      await removerDoCarrinhoServidor(filme.id);
    });
    // Adiciona o botão no card (dentro de info ou onde quiser)
    const infoDiv = itemElem.querySelector('.carrinho-info') || itemElem;
    infoDiv.appendChild(btnRemover);

    conteudo.appendChild(itemElem);

    total += parseFloat(filme.preco) || 0;
  });

  // Exibe total
  const totalElem = document.createElement('p');
  totalElem.className = 'total-carrinho';
  totalElem.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
  conteudo.appendChild(totalElem);
}

// Remove um item do carrinho via API
async function removerDoCarrinhoServidor(itemId) {
  try {
    const resp = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
    if (resp.status === 401) {
      alert('Você precisa estar logado.');
      window.location.href = '/login/login.html';
      return;
    }
    if (!resp.ok) {
      console.error('Erro ao remover item do carrinho:', resp.statusText);
      alert('Erro ao remover item do carrinho.');
      return;
    }
    const data = await resp.json();
    const novoCarrinho = Array.isArray(data.itens) ? data.itens : [];
    mostrarCarrinho(novoCarrinho);
  } catch (err) {
    console.error('Erro de rede ao remover item:', err);
    alert('Erro de rede ao remover item do carrinho.');
  }
}

// Limpa todo o carrinho via API
async function limparCarrinhoServidor() {
  const confirmacao = confirm('Tem certeza que deseja esvaziar o carrinho?');
  if (!confirmacao) return;
  try {
    const resp = await fetch('/api/cart', { method: 'DELETE' });
    if (resp.status === 401) {
      alert('Você precisa estar logado.');
      window.location.href = '/login/login.html';
      return;
    }
    if (!resp.ok) {
      console.error('Erro ao limpar carrinho:', resp.statusText);
      alert('Erro ao limpar carrinho.');
      return;
    }
    const data = await resp.json();
    mostrarCarrinho(Array.isArray(data.itens) ? data.itens : []);
  } catch (err) {
    console.error('Erro de rede ao limpar carrinho:', err);
    alert('Erro de rede ao limpar carrinho.');
  }
}

// Finaliza a compra: aqui normalmente você redireciona para a página de pagamento
async function finalizarCompra() {
  try {
    // Primeiro, obtém o carrinho atual
    const resp = await fetch('/api/cart');
    if (resp.status === 401) {
      alert('Você precisa estar logado.');
      window.location.href = '/login/login.html';
      return;
    }
    if (!resp.ok) {
      console.error('Erro ao obter carrinho para finalizar compra:', resp.statusText);
      alert('Não foi possível obter carrinho. Tente novamente.');
      return;
    }
    const data = await resp.json();
    const carrinho = Array.isArray(data.itens) ? data.itens : [];
    if (carrinho.length === 0) {
      alert('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
      return;
    }
    // Redireciona para a página de pagamento.
    // Se precisar passar dados via query string ou similar, avalie. Normalmente, na página de pagamento você vai refazer GET /api/cart
    window.location.href = '/pagamento/pagamento.html';
  } catch (err) {
    console.error('Erro de rede ao finalizar compra:', err);
    alert('Erro de rede ao finalizar compra.');
  }
}

// (Opcional) Função para atualizar badge/ícone de carrinho no nav
// Caso você tenha um elemento <span id="badge-carrinho"></span> no nav, chame esta função após adicionar/remover
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

// Se em outras partes do frontend você tiver lógica de “adicionar ao carrinho”, use algo como:
// async function adicionarAoCarrinhoServidor(filme) { ... POST /api/cart ... }
// E após adicionar, chame atualizarBadgeCarrinho().