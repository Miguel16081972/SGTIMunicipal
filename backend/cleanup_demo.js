require('dotenv').config();
const { MensajeWhatsapp, Incidencia, Licencia, Inspeccion, Obra } = require('./database/models');
const { Op } = require('sequelize');

async function cleanup() {
  console.log('🚀 Iniciando limpieza selectiva de datos de prueba...');
  
  try {
    // 1. Limpiar Reportes de WhatsApp ANTIGUOS (anteriores a hoy 22/04/2026)
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    
    console.log('--- Limpiando reportes anteriores a:', hoy.toLocaleString());

    const deletedWsp = await MensajeWhatsapp.destroy({
      where: {
        fecha: {
          [Op.lt]: hoy
        }
      }
    });
    console.log(`✅ Se eliminaron ${deletedWsp} reportes de WhatsApp de prueba.`);

    // 2. Limpiar tablas de gestión (demo)
    await Incidencia.destroy({ where: {} });
    await Licencia.destroy({ where: {} });
    await Inspeccion.destroy({ where: {} });
    await Obra.destroy({ where: {} });
    
    console.log(`✅ Tablas de gestión (Obras, Licencias, Inspecciones) limpiadas.`);

    console.log('\n✨ Limpieza completada. El sistema ahora está limpio.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la limpieza:', err);
    process.exit(1);
  }
}

cleanup();
