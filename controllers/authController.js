const passport = require('passport');
const Usuario = require('../models/Usuarios');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

exports.usuarioAutenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.redirect('/iniciar-sesion');
    }
}

exports.cerrarSesion = (req, res) => {
    req.logOut();
    req.flash('exito', 'Se ha cerrado tu sesión');
    res.redirect('/iniciar-sesion');
}