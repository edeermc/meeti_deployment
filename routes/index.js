const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const grupoController = require('../controllers/grupoController');
const meetiController = require('../controllers/meetiController');
const feMeetiController = require('../controllers/frontend/meetiController');
const feUsuariosController = require('../controllers/frontend/usuariosController');
const feGrupoController = require('../controllers/frontend/gruposController');

module.exports = function () {
    router.get('/', homeController.home);

    router.get('/meeti/:slug', feMeetiController.mostrarMeeti);
    router.post('/meeti/:id', authController.usuarioAutenticado, feMeetiController.agregaComentario);
    router.post('/eliminar-comentario', authController.usuarioAutenticado, feMeetiController.eliminaComentario);
    router.post('/confirmar-asistencia/:slug', feMeetiController.asistencia);
    router.get('/asistentes/:slug', feMeetiController.verAsistentes);
    router.get('/usuario/:id', feUsuariosController.verUsuario);
    router.get('/grupo/:id', feGrupoController.verGrupo);
    router.get('/categoria/:slug', feMeetiController.verCategoria);
    router.get('/busqueda', feMeetiController.buscarMeetis);

    router.get('/crear-cuenta', usuariosController.crearCuenta);
    router.post('/crear-cuenta', usuariosController.guardaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmaCuenta);

    router.get('/iniciar-sesion', usuariosController.iniciaSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    router.get('/cerrar-sesion', authController.cerrarSesion);

    router.get('/administracion', authController.usuarioAutenticado, adminController.inicio);
    router.get('/nuevo-grupo', authController.usuarioAutenticado, grupoController.nuevoGrupo);
    router.post('/nuevo-grupo', authController.usuarioAutenticado, grupoController.subeImagen, grupoController.guardaGrupo);
    router.get('/editar-grupo/:grupoId', authController.usuarioAutenticado, grupoController.editaGrupo);
    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado, grupoController.guardaCambios);
    router.get('/imagen-grupo/:grupoId', authController.usuarioAutenticado, grupoController.editaImagen);
    router.post('/imagen-grupo/:grupoId', authController.usuarioAutenticado, grupoController.subeImagen, grupoController.guardaImagen);
    router.get('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, grupoController.eliminaGrupo);
    router.post('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, grupoController.borraGrupo);

    router.get('/nuevo-meeti', authController.usuarioAutenticado, meetiController.nuevoMeeti);
    router.post('/nuevo-meeti', authController.usuarioAutenticado, meetiController.sanitizaMeeti, meetiController.creaMeeti);
    router.get('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.editaMeeti);
    router.post('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.guardaMeeti);
    router.get('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.eliminaMeeti);
    router.post('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.borraMeeti);

    router.get('/editar-perfil', authController.usuarioAutenticado, usuariosController.editaPerfil);
    router.post('/editar-perfil', authController.usuarioAutenticado, usuariosController.guardaPerfil);
    router.get('/cambiar-contrasena', authController.usuarioAutenticado, usuariosController.cambiaContrasena);
    router.post('/cambiar-contrasena', authController.usuarioAutenticado, usuariosController.guardaContrasena);
    router.get('/imagen-perfil', authController.usuarioAutenticado, usuariosController.subirImagenPerfil);
    router.post('/imagen-perfil', authController.usuarioAutenticado, usuariosController.subeImagen, usuariosController.guardaImagenPerfil);

    return router;
}