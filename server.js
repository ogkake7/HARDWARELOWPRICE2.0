const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

loadDotEnv();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'hardwarelowprice-data') : path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'hardware-low-price-local-secret-change-me';
const SESSION_COOKIE = 'hlp_session';

fs.mkdirSync(DATA_DIR, { recursive: true });
process.env.HLP_DATA_DIR = DATA_DIR;
if (!fs.existsSync(DB_PATH)) {
  require('./seed-products');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
  const isPreview = process.env.PUBLIC_PREVIEW === 'true' || process.env.VERCEL_ENV === 'preview';
  const isProduction = process.env.VERCEL_ENV === 'production' || (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview');
  const isHttps = req.headers['x-forwarded-proto'] === 'https' || isProduction;
  const protectFraming = isProduction && !isPreview;
  const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://cdn.atacadoconnect.com",
    "connect-src 'self' https://viacep.com.br",
    "frame-src 'none'",
    "form-action 'self'",
    ...(protectFraming ? ["frame-ancestors 'none'"] : [])
  ].join('; ');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', contentSecurityPolicy);
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (protectFraming) res.setHeader('X-Frame-Options', 'DENY');
  if (isHttps && isProduction && !isPreview) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const attempts = new Map();

function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  const temporary = `${DB_PATH}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(db, null, 2));
  fs.renameSync(temporary, DB_PATH);
}

function publicProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    pricePix: Number(product.pricePix),
    oldPrice: Number(product.oldPrice || 0),
    stock: Number(product.stock || 0),
    featured: Boolean(product.featured),
    visible: Boolean(product.visible),
    badge: product.badge || '',
    icon: product.icon || '◈',
    color: product.color || '#1e293b',
    image: product.image || ''
  };
}

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function safeSettings(settings) {
  return {
    whatsapp: settings.whatsapp || '',
    instagram: settings.instagram || 'hardwarelowprice__',
    dollarRate: Number(settings.dollarRate || 5.10),
    countdownEndsAt: settings.countdownEndsAt || '',
    installments: Number(settings.installments || 12),
    cardFee: Number(settings.cardFee || 0),
    announcement: settings.announcement || ''
  };
}

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function currentUser(req) {
  const token = getToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    return db.users.find((user) => user.id === payload.sub) || null;
  } catch (_error) {
    return null;
  }
}

function sessionCookieOptions(req) {
  const publicHttps = req.headers['x-forwarded-proto'] === 'https' || process.env.PUBLIC_PREVIEW === 'true';
  return `Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=${publicHttps ? 'None' : 'Lax'}${publicHttps ? '; Secure' : ''}`;
}

function setSession(res, req, user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${sessionCookieOptions(req)}`);
}

function clearSession(res, req) {
  const publicHttps = req.headers['x-forwarded-proto'] === 'https' || process.env.PUBLIC_PREVIEW === 'true';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=${publicHttps ? 'None' : 'Lax'}${publicHttps ? '; Secure' : ''}`);
}

function authRequired(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Faça login para continuar.' });
  req.user = user;
  next();
}

function rateLimit(req, key) {
  const now = Date.now();
  const id = `${key}:${req.ip}`;
  const record = attempts.get(id) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (record.resetAt < now) {
    record.count = 0;
    record.resetAt = now + 15 * 60 * 1000;
  }
  record.count += 1;
  attempts.set(id, record);
  return record.count <= 10;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'hardwarelowprice' }));

app.get('/api/settings', (_req, res) => {
  const db = readDb();
  res.json(safeSettings(db.settings));
});

app.get('/api/products', (req, res) => {
  const db = readDb();
  const search = String(req.query.search || '').toLowerCase().trim();
  const category = String(req.query.category || 'all');
  const featured = req.query.featured === 'true';
  const products = db.products
    .filter((product) => product.visible && (product.stock > 0 || product.featured))
    .filter((product) => category === 'all' || product.category === category)
    .filter((product) => !featured || product.featured)
    .filter((product) => !search || `${product.name} ${product.description}`.toLowerCase().includes(search))
    .map(publicProduct);
  res.json(products);
});

app.get('/api/testimonials', (_req, res) => {
  const db = readDb();
  res.json(db.testimonials.filter((item) => item.approved !== false).map((item) => ({
    id: item.id,
    name: item.name,
    city: item.city,
    text: item.text,
    rating: Number(item.rating || 5)
  })));
});

app.get('/api/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/register', (req, res) => {
  if (!rateLimit(req, 'register')) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
    return res.status(400).json({ error: 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.' });
  }
  const db = readDb();
  if (db.users.some((user) => user.email === email)) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  const user = {
    id: `u-${crypto.randomUUID()}`,
    name: name.slice(0, 80),
    email,
    passwordHash: bcrypt.hashSync(password, 12),
    role: 'customer',
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  writeDb(db);
  setSession(res, req, user);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  if (!rateLimit(req, 'login')) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const db = readDb();
  const user = db.users.find((item) => item.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  setSession(res, req, user);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(res, req);
  res.json({ ok: true });
});

app.get('/api/orders', authRequired, (req, res) => {
  const db = readDb();
  const orders = db.orders
    .filter((order) => order.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { items, address, payment, customer, shipping } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'O carrinho está vazio.' });
  const cleanCustomer = {
    name: String(customer?.name || '').trim().slice(0, 100),
    phone: String(customer?.phone || '').replace(/\D/g, '').slice(0, 13),
    email: String(customer?.email || '').trim().toLowerCase().slice(0, 160)
  };
  if (cleanCustomer.name.length < 2 || cleanCustomer.phone.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCustomer.email)) {
    return res.status(400).json({ error: 'Preencha nome, WhatsApp e e-mail válidos.' });
  }
  const shippingMethods = { whatsapp: 'Frete a combinar pelo WhatsApp', pac: 'PAC — cotação pelo WhatsApp', sedex: 'SEDEX — cotação pelo WhatsApp' };
  const selectedShipping = shippingMethods[shipping] ? shipping : 'whatsapp';
  const db = readDb();
  const requested = new Map();
  for (const item of items) {
    const id = String(item.id || '');
    const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity || 0))));
    if (id && quantity) requested.set(id, (requested.get(id) || 0) + quantity);
  }
  const orderItems = [];
  for (const [id, quantity] of requested.entries()) {
    const product = db.products.find((item) => item.id === id && item.visible);
    if (!product) return res.status(400).json({ error: 'Um produto do carrinho não está mais disponível.' });
    if (product.stock < quantity) return res.status(400).json({ error: `Estoque insuficiente para ${product.name}.` });
    orderItems.push({ productId: product.id, name: product.name, quantity, unitPrice: product.pricePix, subtotal: product.pricePix * quantity });
  }
  if (!orderItems.length) return res.status(400).json({ error: 'O carrinho está vazio.' });
  const cleanAddress = {
    cep: String(address?.cep || '').replace(/\D/g, '').slice(0, 8),
    street: String(address?.street || '').trim().slice(0, 160),
    number: String(address?.number || '').trim().slice(0, 20),
    complement: String(address?.complement || '').trim().slice(0, 80),
    neighborhood: String(address?.neighborhood || '').trim().slice(0, 100),
    city: String(address?.city || '').trim().slice(0, 100),
    state: String(address?.state || '').trim().slice(0, 2).toUpperCase()
  };
  if (!cleanAddress.cep || !cleanAddress.street || !cleanAddress.number || !cleanAddress.city || !cleanAddress.state) {
    return res.status(400).json({ error: 'Preencha o endereço de entrega completo.' });
  }
  const settings = safeSettings(db.settings);
  const pixTotal = orderItems.reduce((total, item) => total + item.subtotal, 0);
  const cardTotal = pixTotal * (1 + settings.cardFee / 100);
  const selectedPayment = payment === 'card' ? 'card' : 'pix';
  const order = {
    id: `HLP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    userId: null,
    customer: cleanCustomer,
    items: orderItems,
    address: cleanAddress,
    shipping: { method: selectedShipping, label: shippingMethods[selectedShipping], cost: 0 },
    payment: selectedPayment,
    total: selectedPayment === 'card' ? Math.round(cardTotal * 100) / 100 : Math.round(pixTotal * 100) / 100,
    pixTotal: Math.round(pixTotal * 100) / 100,
    cardTotal: Math.round(cardTotal * 100) / 100,
    status: 'novo',
    createdAt: new Date().toISOString()
  };
  for (const item of orderItems) {
    const product = db.products.find((entry) => entry.id === item.productId);
    product.stock -= item.quantity;
  }
  db.orders.push(order);
  writeDb(db);
  res.status(201).json({ order });
});

app.use(express.static(path.join(ROOT, 'public')));
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'public', 'index.html')));
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint não encontrado.' }));
app.use((_req, res) => res.status(404).send('Página não encontrada.'));

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hardware Low Price] Loja disponível em http://localhost:${PORT}`);
  });
}

module.exports = app;
