
document.addEventListener('DOMContentLoaded', () => {
    initModalListeners();
    initTablaDelegation();
});

/**
 * Escucha los envíos de los formularios dentro de los modales
 */
function initModalListeners() {
    // 1. Modal: Alta de Artículo
    const formAlta = document.getElementById('formAltaArticulo');
    if (formAlta) {
        formAlta.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Submit: Alta de artículo");
            // Aquí llamaremos a la función del servicio después
        });
    }

    // 2. Modal: (Aquí puedes agregar el siguiente, ej: Edición)
    /*
    const formEditar = document.getElementById('formEditarArticulo');
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Submit: Edición de artículo");
        });
    }
    */
}

/**
 * Escucha clics en la tabla de artículos (Delegación de eventos)
 */
function initTablaDelegation() {
    const tabla = document.getElementById('tablaArticulos');
    if (!tabla) return;

    tabla.addEventListener('click', async (e) => {
        // Detectar si se hizo clic en el botón de "Detalle"
        const btnDetalle = e.target.closest('.btn-ver-detalle');
        
        if (btnDetalle) {
            const id = btnDetalle.dataset.id;
            console.log("Clic: Ver detalle del ID", id);
            // Aquí llamaremos a la función para cargar el detalle después
        }
        
        // Aquí puedes agregar más condiciones para otros botones (Editar/Eliminar)
    });
}