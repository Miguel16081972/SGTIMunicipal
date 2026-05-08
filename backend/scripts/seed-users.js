require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const Usuario = require('../models/Usuario');

async function seed() {
  await db.connect();

  const usuarios = [
    { username: 'admin', nombre: 'Administrador General', rol: 'admin', gerencia: 'all' },
    { username: 'g_municipal', nombre: 'Gerente Municipal', rol: 'gerente', gerencia: 'municipal' },
    { username: 'g_seguridad', nombre: 'Gerente de Seguridad', rol: 'gerente', gerencia: 'seguridad' },
    { username: 'g_ambiental', nombre: 'Gerente Ambiental', rol: 'gerente', gerencia: 'ambiental' },
    { username: 'g_rentas', nombre: 'Gerente de Rentas', rol: 'gerente', gerencia: 'rentas' },
    { username: 'g_urbano', nombre: 'Gerente Urbano', rol: 'gerente', gerencia: 'urbano' },
    { username: 'g_humano', nombre: 'Gerente de D. Humano', rol: 'gerente', gerencia: 'humano' },
  ];

  const defaultPassword = '123456';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  for (const u of usuarios) {
    try {
      const exists = await Usuario.findOne({ where: { username: u.username } });
      if (!exists) {
        await Usuario.create({
          username: u.username,
          password: hashedPassword,
          nombre: u.nombre,
          rol: u.rol,
          gerencia: u.gerencia
        });
        console.log(`✅ Usuario creado: ${u.username}`);
      } else {
        console.log(`ℹ️ Usuario ya existe: ${u.username}`);
      }
    } catch (e) {
      console.error(`❌ Error creando ${u.username}:`, e.message);
    }
  }

  console.log('--- Seed completado ---');
  process.exit(0);
}

seed();
