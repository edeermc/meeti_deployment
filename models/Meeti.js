const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid');
const slug = require('slug');
const shortid = require('shortid');
const Usuario = require('../models/Usuarios');
const Grupo = require('../models/Grupos');

const Meeti = db.define('meeti', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid.v4()
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar un titulo para el Meeti'
            }
        }
    },
    slug: Sequelize.STRING,
    invitado: Sequelize.STRING,
    cupo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar una descripción para el Meeti'
            }
        }
    },
    fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar una fecha para el Meeti'
            }
        }
    },
    hora: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar una hora para el Meeti'
            }
        }
    },
    direccion: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar una dirección para el Meeti'
            }
        }
    },
    ciudad: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar una ciudad para el Meeti'
            }
        }
    },
    estado: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar un estado para el Meeti'
            }
        }
    },
    pais: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Debe agregar un país para el Meeti'
            }
        }
    },
    ubicacion: {
        type: Sequelize.GEOMETRY('POINT')
    },
    interesados: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    }
}, {
    hooks: {
        async beforeCreate(meeti) {
            const url = slug(meeti.titulo).toLocaleLowerCase();
            meeti.slug = `${url}-${shortid.generate()}`;
        } 
    }
});

Meeti.belongsTo(Usuario);
Meeti.belongsTo(Grupo);

module.exports = Meeti;