const Categoria = require('../models/Categorias');
const Usuario = require('../models/Usuarios');
const Grupo = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.home = async (req, res) => {
    const consulta = [];
    consulta.push(Categoria.findAll());
    consulta.push(Meeti.findAll({
        attributes: ['titulo', 'slug', 'fecha', 'hora'],
        where: {
            fecha: { [Op.gte]: moment(new Date()).format('YYYY-MM-DD') }
        },
        limit: 3,
        order: [
            ['fecha', 'ASC'],
            [ 'hora' , 'ASC' ]
        ], 
        include: [
            {
                model: Grupo,
                attributes: ['imagen']
            },
            {
                model: Usuario,
                attributes: ['nombre', 'imagen']
            }
        ]
    }));
    const [ categorias, meetis ] = await Promise.all(consulta);

    res.render('home', {
        nombrePagina: 'Bienvenido',
        categorias,
        meetis,
        moment
    });
}