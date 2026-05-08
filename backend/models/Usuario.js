const { DataTypes } = require('sequelize');
const sequelize = require('../database/db').sequelize;

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('admin', 'gerente', 'operador', 'visor'),
    defaultValue: 'visor'
  },
  gerencia: {
    type: DataTypes.STRING, // e.g. 'seguridad', 'rentas', 'all'
    defaultValue: 'all'
  }
}, {
  tableName: 'Usuarios',
  timestamps: true // createdAt, updatedAt
});

module.exports = Usuario;
