const express = require('express');
const router = express.Router();
const { Usuario } = require('../database/models');
const bcrypt = require('bcryptjs');

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
      // El admin solo ve a los gerentes
      whereClause.rol = 'gerente';
    } else {
      // El gerente solo ve a sus operadores
      whereClause.rol = 'operador';
      
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
      attributes: ['id', 'username', 'nombre', 'gerencia', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(personal);
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
      targetRol = 'operador';
      // Usamos la gerencia enviada (ej: serenazgo) o la del usuario por defecto
      targetGerencia = req.body.gerencia || req.user.gerencia;
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

module.exports = router;
