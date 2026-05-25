const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../database/db');

async function migrate() {
  try {
    await db.connect();
    
    // 1. Agregar columna supervisor a MensajeWhatsapps (si no existe)
    try {
      await db.sequelize.query(`ALTER TABLE MensajeWhatsapps ADD COLUMN supervisor VARCHAR(100);`);
      console.log('✅ Columna "supervisor" añadida a MensajeWhatsapps');
    } catch (e) {
      if (e.message.includes('Duplicate column') || e.message.includes('already exists')) {
        console.log('ℹ️  Columna "supervisor" ya existe en MensajeWhatsapps, saltando.');
      } else {
        console.warn('⚠️  Error en MensajeWhatsapps:', e.message);
      }
    }

    // 2. Crear tabla Configuracions (si no existe)
    try {
      await db.sequelize.query(`
        CREATE TABLE IF NOT EXISTS Configuracions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          clave VARCHAR(100) NOT NULL UNIQUE,
          valor VARCHAR(255),
          gerencia VARCHAR(50),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabla "Configuracions" creada (o ya existía)');
    } catch (e) {
      console.warn('⚠️  Error creando Configuracions:', e.message);
    }

    console.log('\n🎉 Migración completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

migrate();
