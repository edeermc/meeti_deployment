import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const asistencia = document.querySelector('#confirmar-asistencia');

    if (asistencia) {
        asistencia.addEventListener('submit', confirmarAsistencia);
    }
});

function confirmarAsistencia(e) {
    e.preventDefault();
    const btn = document.querySelector('#confirmar-asistencia input[type=submit]')
    const accion = document.querySelector('#accion');
    const mensaje = document.querySelector('#mensaje');

    while (mensaje.firstChild) {
        mensaje.removeChild(mensaje.firstChild);
    }
    axios.post(this.action, { accion: accion.value })
        .then(respuesta => {
            if (accion.value === 'confirmar') {
                accion.value = 'cancelar';
                btn.value = 'Cancelar';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');
            } else {
                accion.value = 'confirmar';
                btn.value = 'Si';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul');
            }

            mensaje.appendChild(document.createTextNode(respuesta.data));
        });
}