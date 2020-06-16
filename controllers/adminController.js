const Grupo = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.inicio = async (req, res) => {
    const consultas = [];
    consultas.push(Grupo.findAll({ where: { usuarioId: req.user.id } }));
    consultas.push(Meeti.findAll({ 
        where: { 
            usuarioId: req.user.id, 
            fecha: { [Op.gte]: moment(new Date()).format('YYYY-MM-DD') }
        }, 
        order: [['fecha', 'ASC']]
    }));
    consultas.push(Meeti.findAll({ 
        where: { 
            usuarioId: req.user.id, 
            fecha: { [Op.lt]: moment(new Date()).format('YYYY-MM-DD') }
        } 
    }));
    const [ grupos, meetis, oldmeetis ] = await Promise.all(consultas);
    
    res.render('administracion', {
        nombrePagina: 'Panel de administración',
        grupos,
        meetis,
        oldmeetis,
        moment
    });
}