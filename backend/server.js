require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const database = require('./database/db');
const { initWhatsAppBot } = require('./bot/whatsapp-bot');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: [
    'http://localhost',
    'https://localhost',
    'capacitor://localhost',
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://127.0.0.1:5173',
    'https://app.gobernanzamunicipal.com',
    'http://app.gobernanzamunicipal.com'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configuración de almacenamiento para fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'reporte-' + uniqueSuffix + '.jpg');
  }
});
const upload = multer({ storage });

// Ruta para subir fotos (Pública para la app móvil)
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  // La URL será relativa al dominio donde se despliegue
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ===== RUTAS PÚBLICAS =====
app.use('/api/auth', require('./routes/auth'));

// ===== RUTAS PROTEGIDAS =====
const { authMiddleware } = require('./middleware/auth');

app.use('/api/overview', authMiddleware, require('./routes/overview'));
app.use('/api/seguridad', authMiddleware, require('./routes/seguridad'));
app.use('/api/ambiental', authMiddleware, require('./routes/ambiental'));
app.use('/api/rentas', authMiddleware, require('./routes/rentas'));
app.use('/api/urbano', authMiddleware, require('./routes/urbano'));
app.use('/api/riesgo', authMiddleware, require('./routes/riesgo'));
app.use('/api/humano', authMiddleware, require('./routes/humano'));
app.use('/api/whatsapp', authMiddleware, require('./routes/whatsapp'));
app.use('/api/mapa', authMiddleware, require('./routes/mapa'));
app.use('/api/equipo', authMiddleware, require('./routes/equipo'));
app.use('/api/reportes-movil', require('./routes/reportes-movil'));


// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: database.isConnected() ? 'connected' : 'memory',
    version: '5.0.0',
  });
});

// ===== ESTÁTICOS FRONTEND (PRODUCCIÓN) =====
// Este bloque servirá tu app Vite ya compilada cuando esté en Hostinger
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ===== START =====
async function start() {
  await database.connect();
  
  // Inicializar Bot de WhatsApp
  initWhatsAppBot();
  
  app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║   🏛️  SGTI Municipal — Backend API       ║');
    console.log('  ║   Carmen de La Legua Reynoso             ║');
    console.log(`  ║   🚀 Puerto: ${PORT}                        ║`);
    console.log('  ║   📋 API: http://localhost:' + PORT + '/api     ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log('  Rutas disponibles:');
    console.log('    POST /api/auth/login');
    console.log('    GET  /api/auth/me');
    console.log('    GET  /api/overview');
    console.log('    GET  /api/seguridad/serenazgo');
    console.log('    GET  /api/seguridad/fiscalizacion');
    console.log('    GET  /api/ambiental');
    console.log('    GET  /api/rentas/recaudacion');
    console.log('    GET  /api/rentas/fisc-tributaria');
    console.log('    GET  /api/rentas/desarrollo-eco');
    console.log('    GET  /api/urbano');
    console.log('    GET  /api/riesgo');
    console.log('    GET  /api/humano');
    console.log('    GET  /api/whatsapp');
    console.log('    GET  /api/whatsapp/feed/:grupo');
    console.log('    GET  /api/whatsapp/status');
    console.log('    GET  /api/whatsapp/config');
    console.log('    GET  /api/whatsapp/grupos-conectados');
    console.log('    GET  /api/whatsapp/reportes');
    console.log('    PATCH /api/whatsapp/reportes/:id');
    console.log('    GET  /api/mapa/layers');
    console.log('    GET  /api/mapa/reportes');
    console.log('    GET  /api/health');
    console.log('');
  });
}

start();
