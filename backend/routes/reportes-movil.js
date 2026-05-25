const express = require('express');
const router = express.Router();
const { MensajeWhatsapp, Configuracion } = require('../database/models');
const database = require('../database/db');
const { whatsappFeeds, whatsappReportes } = require('../data/mock-data');


// POST /api/reportes-movil — Recibir reporte desde la app móvil
router.post('/', async (req, res) => {
  const { mensaje, categoria, prioridad, sector, lat, lng, reportadoPor, ubicacion, estado } = req.body;


  if (!mensaje || !categoria || !lat || !lng) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (mensaje, categoria, lat, lng)' });
  }

  const id = 'MOB-' + String(Date.now()).slice(-6);

  const jwt = require('jsonwebtoken');
  // Forzar carga de secreto desde el entorno para evitar desajustes
  const JWT_SECRET = process.env.JWT_SECRET || 'sgti_carmen_legua_secret_key_2026'; 
  let currentUser = null;

  // LOG DE ENTRADA PARA DEPURACIÓN
  console.log('--- NUEVO REPORTE MÓVIL RECIBIDO ---');

  // Intentar obtener usuario si hay token (auth opcional para reportes móviles)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      currentUser = jwt.verify(token, JWT_SECRET);
      console.log(`✅ Token verificado. Usuario: ${currentUser.nombre} (${currentUser.username})`);
    } catch (e) {
      console.warn(`❌ Error verificando token: ${e.message}`);
      console.log(`🔍 Secreto usado: ${JWT_SECRET.substring(0, 5)}...`);
    }
  } else {
    console.log('⚠️ No se recibió cabecera de Authorization (Bearer token)');
  }

  // Mapeo de categorías a grupos principales
  const categoriaAMapa = {
    'Seguridad': 'seguridad',
    'Fiscalización': 'seguridad',
    'Fiscalizacion': 'seguridad',
    'Serenazgo': 'seguridad',
    'Limpieza': 'ambiental',
    'Parques': 'ambiental',
    'Obras': 'urbano',
    'Vías': 'urbano',
    'Rentas': 'rentas',
    'Otros': 'seguridad'
  };

  // Mapeo de sub-áreas de usuarios a grupos de feed principales
  const subAreaAMapa = {
    'serenazgo': 'seguridad',
    'fiscalizacion': 'seguridad',
    'transporte': 'seguridad'
  };

  // Priorizar área del usuario si está logueado (mapeando a grupo principal si es sub-área), sino usar mapeo por categoría
  const userGerencia = (currentUser && currentUser.gerencia) ? currentUser.gerencia : null;
  const grupoPrincipal = subAreaAMapa[userGerencia] || userGerencia || (categoriaAMapa[categoria] || 'seguridad');

  const { reverseGeocode } = require('../bot/geocoder');
  let direccionReal = ubicacion;

  if (lat && lng) {
    const direccionAuto = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    if (direccionAuto) {
      direccionReal = `${direccionAuto} (GPS)`;
    } else {
      direccionReal = `Reporte Móvil GPS (${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)})`;
    }
  }

  const { fotoUrl } = req.body;
  if (fotoUrl) {
    console.log(`📸 [DEBUG MÓVIL] Foto recibida para [${id}].`);
    console.log(`📸 [DEBUG MÓVIL] Comienzo: ${fotoUrl.substring(0, 100)}`);
    console.log(`📸 [DEBUG MÓVIL] Longitud total: ${fotoUrl.length}`);
  } else {
    console.log(`⚠️ [DEBUG MÓVIL] No se recibió fotoUrl para [${id}]`);
  }

  const areasDerivadasGuardar = [grupoPrincipal];
  if (userGerencia && userGerencia !== grupoPrincipal) {
      areasDerivadasGuardar.push(userGerencia);
  }

  const nuevoReporte = {
    idString: id,
    fecha: new Date(),
    grupo: grupoPrincipal,
    grupoWhatsapp: 'App Móvil',
    reportadoPor: currentUser ? currentUser.nombre : (reportadoPor || 'Usuario Móvil'),
    mensaje: `[MÓVIL] ${mensaje}`,
    categoria: categoria,
    prioridad: prioridad || 'Media',
    sector: sector || 'Sector Central',
    ubicacion: direccionReal,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    estado: estado || 'nuevo',
    fotoUrl: fotoUrl || null,
    areasDerivadas: JSON.stringify(areasDerivadasGuardar),
    esDerivacionMultiple: false,
    supervisor: null  // se llenará abajo con el supervisor de turno
  };

  // === Buscar supervisor de turno automáticamente ===
  try {
    const hora = new Date().getHours();
    let claveTurno = 'supervisor_noche'; // 22:00 - 06:00
    if (hora >= 6 && hora < 14) claveTurno = 'supervisor_manana';
    else if (hora >= 14 && hora < 22) claveTurno = 'supervisor_tarde';

    if (Configuracion) {
      const config = await Configuracion.findOne({ where: { clave: claveTurno } });
      if (config && config.valor) {
        nuevoReporte.supervisor = config.valor;
        console.log(`\u2705 Supervisor de turno asignado: ${config.valor} (${claveTurno})`);
      }
    }
  } catch (supErr) {
    console.warn('\u26a0\ufe0f No se pudo asignar supervisor de turno:', supErr.message);
  }


  try {
    // Sincronizar con el Feed en vivo (Memoria)
    if (whatsappFeeds[nuevoReporte.grupo]) {
      whatsappFeeds[nuevoReporte.grupo].unshift({
        id: id,
        time: 'Ahora',
        fecha: nuevoReporte.fecha,
        sender: nuevoReporte.reportadoPor,
        body: nuevoReporte.mensaje,
        tags: [nuevoReporte.prioridad, 'Móvil'],
        color: nuevoReporte.prioridad === 'Alta' ? '#f87171' : '#fbbf24',
        category: nuevoReporte.categoria,
        estado: nuevoReporte.estado,
        lat: nuevoReporte.lat,
        lng: nuevoReporte.lng,
        ubicacion: nuevoReporte.ubicacion,
        fotoUrl: nuevoReporte.fotoUrl
      });
    }

    if (MensajeWhatsapp) {
      const reporte = await MensajeWhatsapp.create(nuevoReporte);
      return res.status(201).json({ message: 'Reporte enviado con éxito', id: reporte.idString });
    } else {
      // También agregar a la lista general de reportes en memoria si no hay DB
      whatsappReportes.unshift({
        id: id,
        ...nuevoReporte,
        areasDerivadas: [nuevoReporte.grupo]
      });

      console.log('⚠️ DB no conectada. Reporte guardado en MEMORIA:', id);
      return res.status(201).json({ message: 'Reporte enviado con éxito (Modo Memoria)', id });
    }
  } catch (err) {
    console.error('Error al guardar reporte móvil:', err.message);
    res.status(500).json({ error: 'Error al procesar el reporte' });
  }
});


module.exports = router;
