// ===== DEPENDÊNCIAS =====
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;

// ===== CONFIGURAÇÃO DE SESSÃO =====
app.use(session({
  secret: 'troque-por-uma-chave-secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
}));

// ===== MIDDLEWARES =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== UTILITÁRIOS (USUÁRIOS & CARRINHO) =====
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const cartsFilePath = path.join(__dirname, 'data', 'carts.json');

function ensureFile(filePath, defaultContent) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, defaultContent, 'utf-8');
}

function readJson(filePath, fallback = []) {
  ensureFile(filePath, JSON.stringify(fallback, null, 2));
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureFile(filePath, '[]');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===== MIDDLEWARES DE AUTENTICAÇÃO =====
function ensureAuthenticated(req, res, next) {
  if (req.session?.userId) return next();
  res.status(401).json({ erro: 'Usuário não autenticado' });
}

function ensureAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ erro: 'Não autenticado' });

  const users = readJson(usersFilePath);
  const user = users.find(u => u.id === req.session.userId);
  if (user?.isAdmin) return next();

  res.status(403).json({ erro: 'Acesso restrito a administradores' });
}

// ===== ROTAS DE AUTENTICAÇÃO =====

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { email, password, confirmPassword, adminCode } = req.body;

  if (!email || !password || !confirmPassword)
    return res.status(400).json({ erro: 'Campos obrigatórios' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ erro: 'Email inválido' });

  if (password !== confirmPassword)
    return res.status(400).json({ erro: 'Senhas diferentes' });

  if (password.length < 6)
    return res.status(400).json({ erro: 'Senha precisa ter ao menos 6 caracteres' });

  const users = readJson(usersFilePath);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(400).json({ erro: 'Email já cadastrado' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const isAdmin = adminCode === 'CODIGO_SECRETO_ADMIN';

    const newUser = { id, email, passwordHash, isAdmin };
    users.push(newUser);
    writeJson(usersFilePath, users);

    req.session.userId = newUser.id;
    req.session.isAdmin = newUser.isAdmin;

    res.json({ sucesso: true, mensagem: 'Registrado com sucesso', isAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no registro' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ erro: 'Email e senha obrigatórios' });

  const users = readJson(usersFilePath);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(400).json({ erro: 'Credenciais inválidas' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ erro: 'Credenciais inválidas' });

  req.session.userId = user.id;
  req.session.isAdmin = user.isAdmin;
  res.json({ sucesso: true, mensagem: 'Login bem-sucedido', isAdmin: user.isAdmin });
});

// GET /api/logout
app.get('/api/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    if (err) return res.status(500).json({ erro: 'Erro ao fazer logout' });
    res.json({ sucesso: true });
  });
});

// GET /api/user
app.get('/api/user', (req, res) => {
  if (!req.session?.userId) return res.json({ authenticated: false });

  const users = readJson(usersFilePath);
  const user = users.find(u => u.id === req.session.userId);
  if (user) {
    return res.json({ authenticated: true, id: user.id, email: user.email, isAdmin: user.isAdmin });
  }
  res.json({ authenticated: false });
});

// ===== ROTAS DE CARRINHO =====

app.get('/api/cart', ensureAuthenticated, (req, res) => {
  const carts = readJson(cartsFilePath, {});
  res.json({ itens: carts[req.session.userId] || [] });
});

app.post('/api/cart', ensureAuthenticated, (req, res) => {
  const item = req.body;
  if (!item?.id) return res.status(400).json({ erro: 'Item inválido' });

  const carts = readJson(cartsFilePath, {});
  const cart = carts[req.session.userId] || [];

  if (!cart.some(i => String(i.id) === String(item.id))) cart.push(item);
  carts[req.session.userId] = cart;

  writeJson(cartsFilePath, carts);
  res.json({ itens: cart });
});

app.delete('/api/cart/:itemId', ensureAuthenticated, (req, res) => {
  const carts = readJson(cartsFilePath, {});
  const userCart = carts[req.session.userId] || [];
  carts[req.session.userId] = userCart.filter(i => String(i.id) !== req.params.itemId);
  writeJson(cartsFilePath, carts);
  res.json({ itens: carts[req.session.userId] });
});

app.delete('/api/cart', ensureAuthenticated, (req, res) => {
  const carts = readJson(cartsFilePath, {});
  carts[req.session.userId] = [];
  writeJson(cartsFilePath, carts);
  res.json({ itens: [] });
});

// ===== SALVAR PEDIDO (CSV) =====

app.post('/salvar-pedido', (req, res) => {
  const pedido = req.body;
  const timestamp = new Date().toISOString();
  const itensStr = Array.isArray(pedido.itens)
    ? pedido.itens.map(i => i.titulo || i.id || JSON.stringify(i)).join('|')
    : '';

  const linha = [
    timestamp,
    pedido.nome || '',
    pedido.email || '',
    itensStr,
    pedido.metodoPagamento || '',
    JSON.stringify(pedido.detalhesPagamento || {})
  ].join(',') + '\n';

  const pedidosPath = path.join(__dirname, 'data', 'pedidos.csv');
  ensureFile(pedidosPath, 'timestamp,nome,email,itens,metodoPagamento,detalhesPagamento\n');
  fs.appendFileSync(pedidosPath, linha);
  res.json({ sucesso: true, mensagem: 'Pedido salvo com sucesso' });
});

// ===== ROTAS ADMIN =====

app.get('/api/admin/pedidos', ensureAdmin, (req, res) => {
  const filePath = path.join(__dirname, 'data', 'pedidos.csv');
  if (!fs.existsSync(filePath)) return res.json({ pedidos: [] });

  const linhas = fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(l => l.trim())
    .slice(1);

  const pedidos = linhas.map(l => {
    const partes = l.split(',');
    return {
      timestamp: partes[0],
      nome: partes[1],
      email: partes[2],
      itens: partes[3] ? partes[3].split('|') : [],
      metodoPagamento: partes[4],
      detalhesPagamento: (() => {
        try {
          return JSON.parse(partes.slice(5).join(','));
        } catch {
          return partes.slice(5).join(',');
        }
      })()
    };
  });

  res.json({ pedidos });
});

// ===== INICIA SERVIDOR =====
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});