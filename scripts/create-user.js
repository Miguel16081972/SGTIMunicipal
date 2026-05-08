require('dotenv').config({ path: './backend/.env' });
const bcrypt = require('bcryptjs');
const database = require('../backend/database/db');
const Usuario = require('../backend/models/Usuario');

async function createUser() {
    const args = process.argv.slice(2);

    if (args.length < 5) {
        console.log('❌ Error: Faltan argumentos.');
        console.log('Uso: node scripts/create-user.js <username> <password> <nombre> <rol> <gerencia>');
        console.log('Ejemplo: node scripts/create-user.js alcalde sgti2026 "Alcalde Municipal" admin all');
        process.exit(1);
    }

    const [username, password, nombre, rol, gerencia] = args;

    try {
        await database.sequelize.authenticate();
        
        // Verificar si ya existe
        const existingUser = await Usuario.findOne({ where: { username } });
        if (existingUser) {
            console.log(`⚠️ El usuario "${username}" ya existe en la base de datos.`);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await Usuario.create({
            username,
            password: hashedPassword,
            nombre,
            rol,
            gerencia
        });

        console.log(`✅ Usuario [${username}] creado exitosamente.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuario:', error.message);
        process.exit(1);
    }
}

createUser();
