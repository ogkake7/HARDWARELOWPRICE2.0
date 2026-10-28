const fs = require('fs');
const path = require('path');

const dataDir = process.env.HLP_DATA_DIR || path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db.json');
const importedCatalogPath = path.join(__dirname, 'data', 'atacado-catalog.json');

const products = [
  {
    id: 'p-iphone-15-pro',
    name: 'iPhone 15 Pro 256GB',
    category: 'smartphones',
    description: 'Titânio, câmera Pro e desempenho para uso intenso. Produto original e lacrado.',
    pricePix: 4999,
    oldPrice: 5599,
    stock: 4,
    featured: true,
    visible: true,
    badge: 'Oportunidade',
    icon: '⌁',
    color: '#182b54',
    image: ''
  },
  {
    id: 'p-ps5-slim',
    name: 'PlayStation 5 Slim',
    category: 'consoles',
    description: 'Console de nova geração com SSD ultrarrápido e leitor de discos.',
    pricePix: 3499,
    oldPrice: 3899,
    stock: 3,
    featured: true,
    visible: true,
    badge: 'Top seller',
    icon: '◈',
    color: '#202c40',
    image: ''
  },
  {
    id: 'p-rtx-4070-super',
    name: 'GeForce RTX 4070 SUPER 12GB',
    category: 'hardware',
    description: 'GPU para alto desempenho em 1440p com ray tracing e DLSS.',
    pricePix: 4299,
    oldPrice: 4699,
    stock: 2,
    featured: true,
    visible: true,
    badge: 'Setup Pro',
    icon: '▦',
    color: '#143a36',
    image: ''
  },
  {
    id: 'p-legion-5',
    name: 'Notebook Gamer Legion 5',
    category: 'notebooks',
    description: 'Tela de alta taxa de atualização, GPU dedicada e construção robusta.',
    pricePix: 5999,
    oldPrice: 6599,
    stock: 1,
    featured: true,
    visible: true,
    badge: 'Última unidade',
    icon: '▣',
    color: '#35244c',
    image: ''
  },
  {
    id: 'p-airpods-pro-2',
    name: 'AirPods Pro 2ª geração',
    category: 'audio',
    description: 'Cancelamento ativo de ruído, estojo MagSafe e áudio espacial.',
    pricePix: 1199,
    oldPrice: 1399,
    stock: 6,
    featured: false,
    visible: true,
    badge: 'Original',
    icon: '))',
    color: '#263144',
    image: ''
  },
  {
    id: 'p-xbox-series-x',
    name: 'Xbox Series X 1TB',
    category: 'consoles',
    description: 'Potência para jogar em 4K, Quick Resume e retrocompatibilidade.',
    pricePix: 3699,
    oldPrice: 4199,
    stock: 2,
    featured: false,
    visible: true,
    badge: 'Game pass ready',
    icon: '✦',
    color: '#193829',
    image: ''
  },
  {
    id: 'p-ryzen-7-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    category: 'hardware',
    description: 'Processador focado em games com cache 3D V-Cache.',
    pricePix: 2199,
    oldPrice: 2499,
    stock: 5,
    featured: false,
    visible: true,
    badge: 'FPS alto',
    icon: '◎',
    color: '#253a5c',
    image: ''
  },
  {
    id: 'p-galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra 256GB',
    category: 'smartphones',
    description: 'Tela Dynamic AMOLED, S Pen e câmera de alta resolução.',
    pricePix: 4599,
    oldPrice: 5199,
    stock: 0,
    featured: false,
    visible: false,
    badge: 'A confirmar',
    icon: '✧',
    color: '#3a2941',
    image: ''
  }
];

function ensureDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const initialProducts = fs.existsSync(importedCatalogPath)
      ? JSON.parse(fs.readFileSync(importedCatalogPath, 'utf8')).products
      : products;
    const db = {
      users: [],
      products: initialProducts,
      orders: [],
      testimonials: [],
      settings: {
        whatsapp: '5511986553934',
        instagram: 'hardwarelowprice__',
        dollarRate: 5.10,
        countdownEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        installments: 12,
        cardFee: 0,
        announcement: 'Peças importadas do Paraguai — do Paraguai direto para a sua casa.'
      }
    };
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Banco inicial criado em data/db.json');
  } else {
    console.log('Banco já existe; nenhum dado foi sobrescrito.');
  }
}

ensureDb();
