const express = require('express');
const router = express.Router();
const { Usuario, MensajeWhatsapp } = require('../database/models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Middleware para verificar si es gerente o admin
const checkManager = (req, res, next) => {
  if (req.user.rol === 'gerente' || req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Gerente.' });
  }
};

// GET /api/equipo/personal — Lista el personal de la gerencia del usuario actual
router.get('/personal', async (req, res) => {
  try {
    const whereClause = {};
    
    if (req.user.rol === 'admin') {
      whereClause.rol = 'gerente';
    } else {
      whereClause.rol = { [Op.in]: ['operador', 'visor'] };
      
      const subAreas = {
        seguridad: ['seguridad', 'serenazgo', 'fiscalizacion', 'transporte'],
        ambiental: ['ambiental'],
        rentas: ['rentas'],
        urbano: ['urbano'],
        humano: ['humano'],
        participacion: ['participacion']
      };
      
      const areasPermitidas = subAreas[req.user.gerencia] || [req.user.gerencia];
      whereClause.gerencia = areasPermitidas;
    }

    const personal = await Usuario.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'nombre', 'gerencia', 'rol', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const personalConConteo = await Promise.all(personal.map(async (u) => {
      const data = u.toJSON();
      if (MensajeWhatsapp) {
        data.reportesHoy = await MensajeWhatsapp.count({
          where: {
            reportadoPor: u.nombre,
            fecha: { [Op.gte]: hoy }
          }
        });
      } else {
        data.reportesHoy = 0;
      }
      return data;
    }));

    res.json(personalConConteo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/equipo/personal/:id/reportes — Obtiene los reportes de un usuario
router.get('/personal/:id/reportes', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!MensajeWhatsapp) return res.json([]);

    const reportes = await MensajeWhatsapp.findAll({
      where: { reportadoPor: usuario.nombre },
      order: [['fecha', 'DESC']],
      limit: 50
    });

    res.json(reportes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/equipo/personal — Crea un nuevo usuario operador
router.post('/personal', async (req, res) => {
  const { username, password, nombre } = req.body;
  
  if (!username || !password || !nombre) {
    return res.status(400).json({ error: 'Faltan datos (username, password, nombre)' });
  }

  try {
    // La gerencia se toma automáticamente del gerente que lo crea
    const gerencia = req.user.gerencia;

    const hashed = await bcrypt.hash(password, 10);
    // Validación de Jerarquía
    const creatorRole = req.user.rol;
    let targetRol = 'operador';
    let targetGerencia = gerencia;

    // Si es admin, puede crear gerentes y asignar cualquier gerencia
    if (creatorRole === 'admin') {
      if (req.body.rol) targetRol = req.body.rol;
      targetGerencia = req.body.gerencia || 'municipal';
    } else {
      // Si es gerente, puede asignar una sub-gerencia de su competencia
      targetRol = (req.body.rol === 'visor') ? 'visor' : 'operador';
      
      const subAreasSeguridad = ['serenazgo', 'fiscalizacion', 'transporte'];
      if (req.user.gerencia === 'seguridad' && subAreasSeguridad.includes(req.body.gerencia)) {
         targetGerencia = req.body.gerencia;
      } else {
         targetGerencia = req.user.gerencia;
      }
    }

    const nuevo = await Usuario.create({
      username,
      password: hashed,
      nombre,
      rol: targetRol,
      gerencia: targetGerencia
    });

    res.json({ message: 'Usuario creado con éxito', id: nuevo.id });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/equipo/personal/:id — Elimina (o desactiva) un usuario
router.delete('/personal/:id', async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Seguridad: Un gerente solo puede borrar a su propia gente o sub-áreas
    if (req.user.rol !== 'admin') {
      const subAreas = {
        seguridad: ['seguridad', 'serenazgo', 'fiscalizacion', 'transporte'],
        ambiental: ['ambiental'],
        rentas: ['rentas'],
        urbano: ['urbano'],
        humano: ['humano'],
        participacion: ['participacion']
      };
      const areasPermitidas = subAreas[req.user.gerencia] || [req.user.gerencia];
      if (!areasPermitidas.includes(user.gerencia)) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar a este usuario' });
      }
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// SUPERVISORES POR TURNO
// ========================================
const { Configuracion } = require('../database/models');

// GET /api/equipo/supervisores-turno — Obtener configuración actual
router.get('/supervisores-turno', async (req, res) => {
  try {
    const configs = await Configuracion.findAll({
      where: { clave: ['supervisor_manana', 'supervisor_tarde', 'supervisor_noche'] }
    });
    const result = {
      supervisor_manana: '',
      supervisor_tarde: '',
      supervisor_noche: ''
    };
    configs.forEach(c => { result[c.clave] = c.valor || ''; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/equipo/supervisores-turno — Guardar configuración de supervisores
router.post('/supervisores-turno', async (req, res) => {
  const { supervisor_manana, supervisor_tarde, supervisor_noche } = req.body;
  
  try {
    const turnos = [
      { clave: 'supervisor_manana', valor: supervisor_manana || '' },
      { clave: 'supervisor_tarde', valor: supervisor_tarde || '' },
      { clave: 'supervisor_noche', valor: supervisor_noche || '' }
    ];

    for (const t of turnos) {
      await Configuracion.upsert({
        clave: t.clave,
        valor: t.valor,
        gerencia: req.user.gerencia || 'seguridad'
      });
    }

    res.json({ message: 'Supervisores de turno actualizados con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
