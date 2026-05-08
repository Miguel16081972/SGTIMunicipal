require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const database = require('./database/db');
const Usuario = require('./models/Usuario');

async function listUsers() {
  try {
    const connected = await database.connect();
    if (!connected) {
      console.log('No se pudo conectar a la base de datos.');
      return;
    }

    const users = await Usuario.findAll({
      attributes: ['id', 'username', 'nombre', 'rol', 'gerencia', 'createdAt']
    });

    console.log('\n--- LISTA DE USUARIOS REGISTRADOS ---');
    console.table(users.map(u => u.toJSON()));
    console.log('-------------------------------------\n');

    await database.disconnect();
  } catch (error) {
    console.error('Error al listar usuarios:', error);
  }
}

listUsers();
