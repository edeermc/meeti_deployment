const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuario = db.define('usuario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: Sequelize.STRING(60),
    imagen: Sequelize.STRING(60),
    descripcion: Sequelize.TEXT,
    correo: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
            isEmail: { msg: 'Agrega un correo valido' }
        }, 
        unique: {
            args: true,
            msg: 'Usuario previamente registrado'
        }
    },
    contrasena: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La contraseña no puede ir vacia' }
        }
    }, 
    activo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    token: Sequelize.STRING(),
    expira: Sequelize.DATE
}, {
    hooks: {
        beforeCreate(usuario) {
            usuario.contrasena = Usuario.prototype.hashContrasena(usuario.contrasena);
        }
    }
});

Usuario.prototype.validaContrasena = function(contrasena) {
    return bcrypt.compareSync(contrasena, this.contrasena);
}

Usuario.prototype.hashContrasena = function (contrasena) {
    return bcrypt.hashSync(contrasena, bcrypt.genSaltSync(10), null);
}

module.exports = Usuario;