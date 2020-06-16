const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const util = require('util');
const ejs = require('ejs');
const fs = require('fs');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

exports.enviarCorreo = async (opciones) => {
    const template = __dirname + `/../views/emails/${opciones.template}.ejs`;
    const compiled = ejs.compile(fs.readFileSync(template, 'utf8'));
    const html = compiled({ url: opciones.url, nombre: opciones.usuario.nombre });

    const opcionesEmail = {
        from: 'Meeti <no-reply@meeti.com>',
        to: opciones.usuario.correo,
        subject: opciones.subject,
        html
    }

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}