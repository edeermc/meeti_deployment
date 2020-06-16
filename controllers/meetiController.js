const Grupo = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const { body, sanitize, validationResult } = require('express-validator');

exports.nuevoMeeti = async (req, res) => {
    const grupos = await Grupo.findAll({ where: { usuarioId: req.user.id } });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear nuevo Meeti',
        grupos
    });
}

exports.sanitizaMeeti = async (req, res, next) => {
    sanitize('titulo');
    sanitize('invitado');
    sanitize('cupo');
    sanitize('fecha');
    sanitize('hora');
    sanitize('direccion');
    sanitize('ciudad');
    sanitize('estado');
    sanitize('pais');
    sanitize('lat');
    sanitize('lng');
    sanitize('grupoId');

    next();
} 

exports.creaMeeti = async (req, res) => {
    const meeti = req.body;
    meeti.usuarioId = req.user.id;
    meeti.ubicacion = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] };
    
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti exitosamente');
        res.redirect('/administracion');
    } catch(error) {
        const erroresSequelize = Object.values(error.errors).map(err => err.message);
        if (erroresSequelize.length) {
            req.flash('error', erroresSequelize);
        }
        res.redirect('/nuevo-meeti');
    }
}

exports.editaMeeti = async (req, res) => {
    consulta = [];
    consulta.push( Grupo.findAll({ where: { usuarioId: req.user.id } }) );
    consulta.push( Meeti.findByPk(req.params.id) );
    const [ grupos, meeti ] = await Promise.all(consulta);

    if (!grupos || !meeti) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administrador');
    } else {
        res.render('editar-meeti', {
            nombrePagina: `Editar meeti - ${meeti.titulo}`,
            grupos,
            meeti
        })
    }
}

exports.guardaMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if (!meeti) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administrador');
    } else {
        const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;
        meeti.grupoId = grupoId;
        meeti.titulo = titulo;
        meeti.invitado = invitado;
        meeti.fecha = fecha;
        meeti.hora = hora;
        meeti.cupo = cupo;
        meeti.descripcion = descripcion;
        meeti.direccion = direccion;
        meeti.ciudad = ciudad;
        meeti.estado = estado;
        meeti.pais = pais;
        meeti.ubicacion = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)] };

        await meeti.save();
        req.flash('exito', 'Cambios guardados exitosamente');
        res.redirect('/administracion');
    }
}

exports.eliminaMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if (!meeti) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administracion');
    } else {
        res.render('elimina-meeti', {
            nombrePagina: `Eliminar meeti - ${meeti.titulo}`
        });
    }
}

exports.borraMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if (!meeti) {
        req.flash('error', 'Operación no permitida');
    } else {
        await Meeti.destroy({ where: { id: req.params.id, usuarioId: req.user.id } });
        req.flash('exito', 'Se ha eliminado el meeti correctamente');
    }
    
    res.redirect('/administracion');
}