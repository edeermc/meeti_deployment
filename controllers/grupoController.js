const Categoria = require('../models/Categorias');
const Grupo = require('../models/Grupos');
const { sanitize, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { filesize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/grupos/')
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

exports.nuevoGrupo = async (req, res) => {
    const categorias = await Categoria.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}

exports.guardaGrupo = async (req, res) => {
    const rules = [
        sanitize('nombre'),
        sanitize('url')
    ];
    await Promise.all(rules.map( validation => validation.run(req)));
    const errores = validationResult(req);

    const grupo = req.body;
    grupo.usuarioId = req.user.id;
    grupo.categoriumId = req.body.categoria;
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    try {
        await Grupo.create(grupo);
        req.flash('exito', 'Se ha creado el grupo exitosamente');
        res.redirect('/administracion');
    } catch (error) {
        const erroresSequelize = Object.values(error.errors).map(err => err.message);
        if (erroresSequelize.length) {
            req.flash('error', erroresSequelize);
        }
        res.redirect('/nuevo-grupo');
    }
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

exports.editaGrupo = async (req, res) => {
    const consultas = [];
    consultas.push(Grupo.findByPk(req.params.grupoId));
    consultas.push(Categoria.findAll());
    const [ grupo, categorias ] = await Promise.all(consultas);
    
    if (!grupo) {
        req.flash('error', 'Esta operación no es permitida');
        res.redirect('/administracion');
        next();
    } else {
        res.render('editar-grupo', {
            nombrePagina: `Editar grupo - ${grupo.nombre}`,
            grupo,
            categorias
        });
    } 
}

exports.guardaCambios = async (req, res, next) => {
    const grupo = await Grupo.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if (!grupo) {
        req.flash('error', 'Esta operación no es permitida');
        res.redirect('/administracion');
        next();
    } else {
        const { nombre, descripcion, categoria, url } = req.body;
        grupo.nombre = nombre;
        grupo.descripcion = descripcion;
        grupo.categoriumId = categoria;
        grupo.url = url;
        await grupo.save();

        req.flash('exito', 'Lo cambios se han guardado correctamente');
        res.redirect('/administracion');
        next();
    }
}

exports.editaImagen = async (req, res) => {
    const grupo = await Grupo.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    res.render('imagen-grupo', {
        nombrePagina: `Editar imagen del grupo - ${grupo.nombre}`,
        grupo
    });
}

exports.guardaImagen = async (req, res, next) => {
    const grupo = await Grupo.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if (!grupo) {
        req.flash('error', 'Esta operación no es permitida');
        res.redirect('/administracion');
        next();
    } else {
        if (req.file && grupo.imagen) {
            const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
            fs.unlink(imagenAnterior, error => {
                if (error) {
                    console.log(error);
                    return;
                }
            });
        }
        
        if (req.file) {
            grupo.imagen = req.file.filename;
        }
        await grupo.save();

        req.flash('exito', 'Lo cambios se han guardado correctamente');
        res.redirect('/administracion');
        next();
    }
}

exports.eliminaGrupo = async (req, res, next) => {
    const grupo = await Grupo.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if (!grupo) {
        req.flash('error', 'Esta operación no es permitida');
        res.redirect('/administracion');
        return next();
    } else {
        res.render('elimina-grupo', {
            nombrePagina: `Eliminar grupo - ${grupo.nombre}`
        });
    }
}

exports.borraGrupo = async (req, res, next) => {
    const grupo = await Grupo.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if (!grupo) {
        req.flash('error', 'Esta operación no es permitida');
        res.redirect('/administracion');
        return next();
    } else {
        if (grupo.imagen) {
            const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
            fs.unlink(imagenAnterior, error => {
                if (error) {
                    console.log(error);
                    return;
                }
            });
        }

        await Grupo.destroy({ where: { id: req.params.grupoId, usuarioId: req.user.id } });
        req.flash('exito', 'Se ha eliminado el grupo correctamente');
        res.redirect('/administracion');
        return next();
    };
}