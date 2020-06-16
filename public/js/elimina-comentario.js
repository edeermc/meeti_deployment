import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const formsEliminar = document.querySelectorAll('.elimina-comentario');

    if (formsEliminar.length) {
        formsEliminar.forEach( form => {
            form.addEventListener('submit', eliminaComentario);
        });
    }
});

function eliminaComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: 'Eliminar comentario',
        text: 'Un comentario eliminado, no se puede recuperar',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, borrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.value) {
            const comentarioId = this.children[0].value;

            axios.post(this.action, { comentarioId })
                .then(respuesta => {
                    Swal.fire('Eliminado', respuesta.data, 'success');
                    this.parentElement.parentElement.remove();
                })
                .catch(error => {
                    Swal.fire('Ha ocurrido un error', error.response.data, 'error');
                });
        }
    })

}