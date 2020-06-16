const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const Categoria = require('../models/Categorias');
const Usuario = require('../models/Usuarios');

const Grupo = db.define('grupo', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false, 
        defaultValue: uuidv4()
    },
    nombre: {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del grupo es obligatorio'
            }
        }
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false, 
        validate: {
            notEmpty: {
                msg: 'La descripción no puede ir vacía'
            }
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT
}, {
    hooks: {
        beforeCreate(grupo) {
            grupo.id = uuidv4();
        }
    }
});

Grupo.belongsTo(Categoria);
Grupo.belongsTo(Usuario);

module.exports = Grupo;