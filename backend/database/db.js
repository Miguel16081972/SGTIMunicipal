const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const path = require('path');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    storage: process.env.DB_STORAGE ? path.resolve(__dirname, '..', process.env.DB_STORAGE) : path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

class Database {
  constructor() {
    this.connected = false;
    this.sequelize = sequelize;
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      
      this.connected = true;
      console.log('✅ Base de datos conectada con éxito (MySQL)');

      // Importar Modelos aquí para evitar dependencias circulares tempranas
      const Usuario = require('../models/Usuario');
      // Importar todos los modelos para que se sincronicen
      const Models = require('./models');
      
      // Sincroniza la estructura de la tabla (Método seguro)
      await this.sequelize.sync({ alter: false });
      console.log('✅ Estructura de base de datos confirmada.');
      
      // --- SEEDING INICIAL DE USUARIOS ---
      const usuariosSeed = [
        { username: 'admin', password: 'sgti2026', nombre: 'Administrador Municipal', rol: 'admin', gerencia: 'all' },
        { username: 'g_municipal', password: '123456', nombre: 'Gerente Municipal', rol: 'gerente', gerencia: 'municipal' },
        { username: 'g_seguridad', password: '123456', nombre: 'Gerente de Seguridad', rol: 'gerente', gerencia: 'seguridad' },
        { username: 'g_ambiental', password: '123456', nombre: 'Gerente Ambiental', rol: 'gerente', gerencia: 'ambiental' },
        { username: 'g_rentas', password: '123456', nombre: 'Gerente de Rentas', rol: 'gerente', gerencia: 'rentas' },
        { username: 'g_urbano', password: '123456', nombre: 'Gerente Urbano', rol: 'gerente', gerencia: 'urbano' },
        { username: 'g_humano', password: '123456', nombre: 'Gerente de D. Humano', rol: 'gerente', gerencia: 'humano' },
        { username: 'g_participacion', password: '123456', nombre: 'Participación Vecinal', rol: 'gerente', gerencia: 'participacion' },
      ];

      for (const u of usuariosSeed) {
        const [user, created] = await Usuario.findOrCreate({
          where: { username: u.username },
          defaults: {
            username: u.username,
            password: await bcrypt.hash(u.password, 10),
            nombre: u.nombre,
            rol: u.rol,
            gerencia: u.gerencia
          }
        });
        if (created) {
          console.log(`🌱 Usuario [${u.username}] creado exitosamente.`);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error.message);
      this.connected = false;
      return false;
    }
  }

  async disconnect() {
    await this.sequelize.close();
    this.connected = false;
    console.log('🔌 Base de datos desconectada');
  }

  isConnected() {
    return this.connected;
  }
}

module.exports = new Database();

