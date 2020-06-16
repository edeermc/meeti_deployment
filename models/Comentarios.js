const Sequelize = require('sequelize');
const db = require('../config/db');
const Usuario = require('../models/Usuarios');
const Meeti = require('../models/Meeti');

const Comentario = db.define('comentario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mensaje: Sequelize.TEXT
}, {
    timestamps: false
});

Comentario.belongsTo(Usuario);
Comentario.belongsTo(Meeti);

module.exports = Comentario;