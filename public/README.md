# projetoFilmeB1
link do video: https://www.youtube.com/watch?v=NXdukqWxk4w

# ProjetoB2 - Loja de Filmes com Node.js e CSV

## Como rodar localmente

1. Clone ou copie este repositório.
2. Execute `npm install` para instalar dependências (Express).
3. Execute `node server.js` ou `npm start`.
4. Abra o navegador em `http://localhost:3000/`.
5. Use a aplicação: adicione filmes, finalize compra, os pedidos são gravados em `data/pedidos.csv`.

## Estrutura
- `public/`: front-end estático (HTML/CSS/JS).
- `server.js`: servidor Express.
- `data/pedidos.csv`: arquivo gerado contendo pedidos.

## Observações
- Em ambiente de produção, não salve dados sensíveis como número de cartão em CSV. Aqui serve para aprendizado/local.
