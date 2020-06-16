const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/Usuarios');

passport.use(new LocalStrategy({
        usernameField: 'correo',
        passwordField: 'contrasena'
    }, 
    async (correo, contrasena, done) => {
        const usuario = await Usuario.findOne({ where: { correo, activo: 1 } });
        
        if (!usuario) {
            return done(null, false, { message: 'El usuario con el que intenta acceder no esta registrado' });
        } else {
            const validaContrasena = usuario.validaContrasena(contrasena);
            if (!validaContrasena) {
                return done(null, false, { message: 'La contraseña es incorrecta' });
            } else {
                return done(null, usuario);
            }
        }
    }
));

passport.serializeUser(function(usuario, cb) { 
    cb(null, usuario);
});

passport.deserializeUser(function(usuario, cb) {
    cb(null, usuario);
});

module.exports = passport;