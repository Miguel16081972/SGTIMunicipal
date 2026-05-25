require('dotenv').config();
const { MensajeWhatsapp } = require('./database/models');

async function limpiarMapa() {
  console.log('🚀 Iniciando limpieza de datos inventados del mapa...');
  
  try {
    // Eliminar todos los reportes de WhatsApp (datos inventados y de prueba)
    const borrados = await MensajeWhatsapp.destroy({ where: {} });
    
    console.log(`✅ ¡Éxito! Se han eliminado ${borrados} reportes/datos del mapa.`);
    console.log('✨ El mapa territorial ahora está completamente limpio.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al limpiar la base de datos:', err);
    process.exit(1);
  }
}

limpiarMapa();
