const Usuario = require('../models/Usuarios');
const { sanitize, body, validationResult } = require('express-validator');
const correo = require('../handlers/email');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { filesize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/perfiles/')
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter (req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            next(null, true);
        } else {
            next(new Error('El formato del archivo no es válido'), false);

        }
    }
}
const upload = multer(configuracionMulter).single('imagen');

exports.crearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta'
    });
}

exports.guardaCuenta = async (req, res) => {
    const rules = [
        body('confirmar').notEmpty().withMessage('Debe confirmar la contraseña por seguridad'),
        body('confirmar').equals(req.body.contrasena).withMessage('Las contraseñas no coinciden')
    ];
    await Promise.all(rules.map( validation => validation.run(req)));
    const errores = validationResult(req);
    try {
        const usuario = await Usuario.create(req.body);
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.correo}`;
        correo.enviarCorreo({
            usuario,
            url,
            subject: 'Confirmar tu cuenta de Meeti',
            template: 'confirmar-cuenta'
        });
        req.flash('exito', 'Hemos enviado un correo, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        const erroresSequelize = Object.values(error.errors).map(err => err.message);
        const errExp = errores.array().map(err => err.msg);
        const listaErrores = [...errExp, ...erroresSequelize];
        
        if (listaErrores.length) {
            req.flash('error', listaErrores);
        }
        
        res.redirect('/crear-cuenta');
    }
}

exports.confirmaCuenta = async (req, res) => {
    const usuario = await Usuario.findOne({ where: { correo: req.params.correo } });

    if (!usuario) {
        req.flash('error', 'No existe una cuenta registrada con esta dirección de correo');
        res.redirect('/crear-cuenta');
    } else {
        usuario.activo = 1;
        await usuario.save();

        req.flash('exito', 'La cuenta se ha confirmado exitosamente');
        res.redirect('/iniciar-sesion');
    }
}

exports.iniciaSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar sesión'
    });
}

exports.editaPerfil = async (req, res) => {
    const usuario = await Usuario.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar tu perfil',
        usuario
    })
}

exports.guardaPerfil = async (req, res) => {
    const usuario = await Usuario.findByPk(req.user.id);
    sanitize('nombre');
    sanitize('descripcion');
    sanitize('correo');
    const { nombre, descripcion, correo } = req.body;
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.correo = correo;
    
    try {
        await usuario.save();
        req.flash('exito', 'Se han guardado los cambios en tu perfil exitosamente');
    } catch (error) {
        const errExp = Object.values(error.errors).map(err => err.message);
        req.flash('error', errExp);
    }

    res.redirect('/administracion');
}

exports.cambiaContrasena = (req, res) => {
    res.render('cambiar-contrasena', {
        nombrePagina: 'Cambia tu contraseña'
    });
}

exports.guardaContrasena = async (req, res) => {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario.validaContrasena(req.body.contrasena_anterior)) {
        req.flash('error', 'La contraseña actual no coincide, intenta nuevamente');
        res.redirect('/administracion');
    } else {
        if (req.body.contrasena_nueva === req.body.contrasena_repetir) {
            usuario.contrasena = usuario.hashContrasena(req.body.contrasena_nueva);
            await usuario.save();
            req.flash('exito', 'Se ha cambiado la contraseña exitosamente');
            res.redirect('/administracion');
        } else {
            req.flash('error', 'La contraseña que intenta asignar no coincide, intenta nuevamente');
            res.redirect('/cambiar-contrasena');
        }
    }
}

exports.subirImagenPerfil = async (req, res) => {
    const usuario = await Usuario.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Subir imagen de perfil',
        usuario
    });
}

exports.subeImagen = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El tamaño del archivo es mayor al perminito');
                } else {
                    req.flash('error', error.message);
                }
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            
            res.redirect('back');
        } else {
            next();
        }
    });
}

exports.guardaImagenPerfil = async (req, res) => {
    const usuario = await Usuario.findByPk(req.user.id);

    if (req.file && usuario.imagen) {
        const imagenAnterior = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
        fs.unlink(imagenAnterior, error => {
            if (error) {
                console.log(error);
                return;
            }
        });
    }
    
    if (req.file) {
        usuario.imagen = req.file.filename;
    }
    await usuario.save();

    req.flash('exito', 'Lo cambios se han guardado correctamente');
    res.redirect('/administracion');
}