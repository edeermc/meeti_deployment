const Usuario = require('../../models/Usuarios');
const Grupo = require('../../models/Grupos');

exports.verUsuario = async (req, res) => {
    const consultas = [];
    consultas.push( Usuario.findByPk(req.params.id) );
    consultas.push( Grupo.findAll({ where: { usuarioId: req.params.id } }) );
    const [ usuario, grupos ] = await Promise.all(consultas);

    if (!usuario) {
        res.redirect('/');
    } else {
        res.render('mostrar-perfil', {
            nombrePagina: `Perfil de ${usuario.nombre}`,
            usuario,
            grupos
        });
    }
}