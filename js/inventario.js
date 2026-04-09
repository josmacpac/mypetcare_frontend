import { crearArticulo, obtenerArticulos, rellenarTablaArticulos } from "./articulos.js";

// ===============================
// Inicialización
// ===============================

document.addEventListener("DOMContentLoaded", () => {  

    // Cargar datos iniciales
    // cargarListaArticulos(); 
    
    registrarEventos();
    refrescarVista();
});


// ===============================
// Eventos y formularios
// ===============================

function registrarEventos() {
    /* const tabla = document.getElementById("tablaArticulos");
    let id_seleccionado = ""; // Para guardar el ID cuando hagas clic en la tabla

    // Delegación de eventos para la tabla
    tabla.addEventListener("click", function (e) {
        const btnDetalle = e.target.closest(".btn-ver-detalle");
        const btnEditar = e.target.closest(".btn-editar");

        if (btnDetalle) {
            id_seleccionado = btnDetalle.dataset.id;
            consultarDetalleArticulo(id_seleccionado);
        }

        if (btnEditar) {
            id_seleccionado = btnEditar.dataset.id;
            abrirModalEdicion(id_seleccionado);
        }
    }); */

    // Listeners de formularios (Modales)
    document.getElementById("formAltaArticulo").addEventListener("submit", (e) => registrarNuevoArticulo(e));
    
}

// ===============================
// Funciones
// ===============================

async function refrescarVista() {
    const lista = await obtenerArticulos();
    rellenarTablaArticulos(lista);
}


async function registrarNuevoArticulo(e){
    e.preventDefault();
    console.log("Formulario detenido, iniciando envío...");
    try {
            // Llamamos directamente a la función del servicio pasando el formulario
            await crearArticulo(e.target);
            
            alert("✅ Artículo registrado");
            e.target.reset();
            
            // Cerrar modal (puedes usar una función genérica)
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAltaArticulo'));
            if (modal) modal.hide();
            
        } catch (error) {
            alert("❌ Error: " + error.message);
        }
}
