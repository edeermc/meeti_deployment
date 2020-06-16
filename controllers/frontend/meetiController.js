const Meeti = require('../../models/Meeti');
const Grupo = require('../../models/Grupos');
const Usuario = require('../../models/Usuarios');
const Categoria = require('../../models/Categorias');
const Comentario = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { sanitize } = require('express-validator');

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ 
        where: { slug: req.params.slug },
        include: [
            { model: Grupo },
            {
                model: Usuario,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    if (!meeti) {
        res.redirect('/');
    } else {
        const ubicacion = Sequelize.literal(`ST_GeomFromText('POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`);
        const distancia = Sequelize.fn('ST_Distance_Sphere', Sequelize.col('ubicacion'), ubicacion);
        const cercanos = await Meeti.findAll({
            where: Sequelize.where(distancia, {[Op.lte]: 2000}),
            order: distancia,
            limit: 3,
            offset: 1,
            include: [
                { model: Grupo },
                {
                    model: Usuario,
                    attributes: ['id', 'nombre', 'imagen']
                }
            ]
        });

        const comentarios = await Comentario.findAll({ 
            where: { meetiId: meeti.id },
            include: [{
                model: Usuario, 
                attributes: ['id', 'nombre', 'imagen']
            }]
        });

        res.render('mostrar-meeti', {
            nombrePagina: meeti.titulo,
            meeti,
            comentarios,
            moment,
            cercanos
        });
    }
}

exports.asistencia = async (req, res) => {
    let fn_name = '';
    if (req.body.accion === 'confirmar') {
        fn_name = 'array_append';
    } else {
        fn_name = 'array_remove';
    }
    
    Meeti.update({
        'interesados': Sequelize.fn(fn_name, Sequelize.col('interesados'), req.user.id)
    }, {
        where: {
            slug: req.params.slug
        }
    });

    if (req.body.accion === 'confirmar') {
        res.send('Haz confirmado tu asistencia');
    } else {
        res.send('Haz cancelado tu asistencia');
    }
}

exports.verAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({ 
        attributes: [ 'titulo', 'interesados' ],
        where: { slug: req.params.slug } 
    });

    const asistentes = await Usuario.findAll({
        attributes: [ 'nombre', 'imagen' ],
        where: {
            id: meeti.interesados
        }
    })

    res.render('asistentes-meeti', {
        nombrePagina: `Listado de asistentes a ${meeti.titulo}`,
        asistentes
    });
}

exports.verCategoria = async (req, res) => {
    const categoria = await Categoria.findOne({ 
        attributes: [ 'nombre', 'id' ],
        where: { slug: req.params.slug } 
    });
    const meetis = await Meeti.findAll({
        include: [
            { 
                model: Grupo,
                where: { categoriumId: categoria.id }
            }, {
                model: Usuario
            }
        ],
        order: [
            [ 'fecha' , 'ASC' ],
            [ 'hora' , 'ASC' ]
        ]
    });

    res.render('mostrar-categoria', {
        nombrePagina: `Categoria ${categoria.nombre}`,
        meetis,
        moment
    });
}

exports.agregaComentario = async (req, res) => {
    sanitize('comentario');
    await Comentario.create({
        mensaje: req.body.comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    res.redirect('back');
}

exports.eliminaComentario = async (req, res) => {
    const comentario = await Comentario.findByPk(req.body.comentarioId);
    
    if (!comentario) {
        res.status(404).send('Acción no permitida');
    } else {
        const meeti = await Meeti.findByPk(comentario.meetiId);

        if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
            await Comentario.destroy({
                where: { id: comentario.id }
            });
            res.status(200).send('Se ha eliminado el comentario exitosamente');
        } else {
            res.status(403).send('Acción no permitida');
        }
    }
}

exports.buscarMeetis = async (req, res) => {
    const { categoria, titulo, ciudad, pais } = req.query;
    let categoriaWhere = '';
    if (categoria === '') {
        categoriaWhere = '';
    } else {
        categoriaWhere = `where: { 
            categoriumId: { [Op.eq]: ${categoria} } 
        }`;
    }
    const meetis = await Meeti.findAll({
        where: {
            titulo: { [Op.iLike]: `%${titulo}%` },
            ciudad: { [Op.iLike]: `%${ciudad}%` },
            pais: { [Op.iLike]: `%${pais}%` }
        }, 
        include: [
            { 
                model: Grupo,
                categoriaWhere
            }, {
                model: Usuario,
                attributes: [ 'id', 'nombre', 'imagen' ]
            }
        ]
    });

    res.render('busqueda', {
        nombrePagina: 'Resultados de la búsqueda',
        meetis,
        moment
    });
}