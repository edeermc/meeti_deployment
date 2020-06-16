const Grupo = require('../../models/Grupos');
const Meeti = require('../../models/Meeti');
const moment = require('moment');

exports.verGrupo = async (req, res) => {
    const consultas = [];
    consultas.push( Grupo.findByPk(req.params.id) );
    consultas.push( Meeti.findAll({
        where: { grupoId: req.params.id },
        order: [
            [ 'fecha', 'ASC' ],
            [ 'hora' , 'ASC' ]
        ]
    }) );

    const [ grupo, meetis ] = await Promise.all(consultas);
    if (!grupo) {
        res.redirect('/');
    } else {
        res.render('mostrar-grupo', {
            nombrePagina: `Información del grupo: ${grupo.nombre}`,
            grupo,
            meetis, 
            moment
        })
    }
}