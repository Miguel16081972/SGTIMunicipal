const express = require('express');
const router = express.Router();
const { MensajeWhatsapp } = require('../database/models');
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
  const JWT_SECRET = process.env.JWT_SECRET || 'sgti_secret_key';
  let currentUser = null;

  // Intentar obtener usuario si hay token (auth opcional para reportes móviles)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      currentUser = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.warn('Token inválido en reporte móvil, procediendo como anónimo');
    }
  }

  // Mapeo de categorías a grupos principales
  const categoriaAMapa = {
    'Seguridad': 'seguridad',
    'Limpieza': 'ambiental',
    'Obras': 'urbano',
    'Fiscalización': 'seguridad',
    'Tránsito': 'seguridad',
    'Riesgos': 'riesgo',
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
    console.log(`📸 Foto recibida [${id}]. Longitud: ${fotoUrl.length} caracteres.`);
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
    areasDerivadas: JSON.stringify([grupoPrincipal]),
    esDerivacionMultiple: false
  };


  try {
    if (MensajeWhatsapp && database.isConnected()) {
      const reporte = await MensajeWhatsapp.create(nuevoReporte);
      return res.status(201).json({ message: 'Reporte enviado con éxito', id: reporte.idString });
    } else {
      // Fallback a MEMORIA para que aparezca en el feed aunque no haya DB
      if (whatsappFeeds[nuevoReporte.grupo]) {
        whatsappFeeds[nuevoReporte.grupo].unshift({
          time: 'Ahora',
          sender: nuevoReporte.reportadoPor,
          body: nuevoReporte.mensaje,
          tags: [nuevoReporte.prioridad, 'Móvil'],
          color: nuevoReporte.prioridad === 'Alta' ? '#f87171' : '#fbbf24',
          category: nuevoReporte.categoria,
          estado: nuevoReporte.estado,
          lat: nuevoReporte.lat,

          lng: nuevoReporte.lng
        });
      }
      
      // También agregar a la lista general de reportes en memoria
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
