const Sequelize = require('sequelize');
const db = require('../config/db');

const Categoria = db.define('categoria', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: Sequelize.TEXT,
    slug: Sequelize.STRING(100)
});

module.exports = Categoria;