const { DataTypes } = require('sequelize');
const db = require('./db');
const sequelize = db.sequelize;

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'gerente', 'operador', 'visor'), defaultValue: 'visor' },
  gerencia: { type: DataTypes.STRING(50) },
});

const Incidencia = sequelize.define('Incidencia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  sector: { type: DataTypes.STRING(20) },
  direccion: { type: DataTypes.STRING(200) },
  lat: { type: DataTypes.DECIMAL(10, 6) },
  lng: { type: DataTypes.DECIMAL(10, 6) },
  prioridad: { type: DataTypes.ENUM('alta', 'media', 'baja'), defaultValue: 'media' },
  estado: { type: DataTypes.ENUM('pendiente', 'en_proceso', 'atendida', 'cerrada'), defaultValue: 'pendiente' },
  fuente: { type: DataTypes.STRING(50) }, // whatsapp, serenazgo, vecino
});

const Licencia = sequelize.define('Licencia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  negocio: { type: DataTypes.STRING(100), allowNull: false },
  ruc: { type: DataTypes.STRING(11) },
  rubro: { type: DataTypes.STRING(50) },
  direccion: { type: DataTypes.STRING(200) },
  sector: { type: DataTypes.STRING(20) },
  fecha_emision: { type: DataTypes.DATE },
  fecha_vencimiento: { type: DataTypes.DATE },
  estado: { type: DataTypes.ENUM('activa', 'vencida', 'suspendida', 'revocada'), defaultValue: 'activa' },
  tiene_itsdc: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Inspeccion = sequelize.define('Inspeccion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  negocio: { type: DataTypes.STRING(100) },
  direccion: { type: DataTypes.STRING(200) },
  inspector: { type: DataTypes.STRING(100) },
  fecha: { type: DataTypes.DATE },
  resultado: { type: DataTypes.ENUM('aprobado', 'observado', 'rechazado') },
  observaciones: { type: DataTypes.TEXT },
});

const Obra = sequelize.define('Obra', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100) },
  ubicacion: { type: DataTypes.STRING(200) },
  avance: { type: DataTypes.INTEGER, defaultValue: 0 },
  plazo: { type: DataTypes.DATE },
  estado: { type: DataTypes.ENUM('por_iniciar', 'en_plazo', 'retraso', 'culminada') },
  presupuesto: { type: DataTypes.DECIMAL(12, 2) },
});

// Modelo Específico de Reportes WhatsApp
const MensajeWhatsapp = sequelize.define('MensajeWhatsapp', {
  idString: { type: DataTypes.STRING(50), primaryKey: true },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  grupo: { type: DataTypes.STRING(50) },             // área principal asignada
  grupoWhatsapp: { type: DataTypes.STRING(100) },     // nombre real del grupo de WA
  reportadoPor: { type: DataTypes.STRING(100) },
  telefono: { type: DataTypes.STRING(20) },
  mensaje: { type: DataTypes.TEXT },
  categoria: { type: DataTypes.STRING(50) },
  prioridad: { type: DataTypes.STRING(20) },
  sector: { type: DataTypes.STRING(50) },
  ubicacion: { type: DataTypes.STRING(200) },          // dirección original o GPS
  direccionExtraida: { type: DataTypes.STRING(200) },  // dirección parseada del texto
  lat: { type: DataTypes.DECIMAL(10, 6) },
  lng: { type: DataTypes.DECIMAL(10, 6) },
  estado: { type: DataTypes.STRING(20), defaultValue: 'nuevo' },
  asignadoA: { type: DataTypes.STRING(100) },
  notas: { type: DataTypes.TEXT },
  fotoUrl: { type: DataTypes.TEXT('long') },
  areasDerivadas: { type: DataTypes.TEXT },             // JSON array de áreas derivadas
  esDerivacionMultiple: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const GrupoVinculado = sequelize.define('GrupoVinculado', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  remoteId: { type: DataTypes.STRING(100), unique: true }, // ID de WhatsApp (@g.us)
  nombre: { type: DataTypes.STRING(100) },
  areaId: { type: DataTypes.STRING(50) },                 // seguridad, ambiental, etc.
  monitoreado: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

// Relaciones (si necesitamos consultas JOIN)
Incidencia.belongsTo(Usuario, { as: 'reportador' });

module.exports = { Usuario, Incidencia, Licencia, Inspeccion, Obra, MensajeWhatsapp, GrupoVinculado };
