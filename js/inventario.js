import { crearArticulo, obtenerArticulos, rellenarTablaArticulos, registrarNuevoArticulo, filtrarArticulos} from "./articulos.js";
import { filtrarLista, renderizarTablaExistencia, refrescarVista, renderizarTablaTemporal} from './utils.js';
import { customFetch} from './sesion.js';


// ===============================
// Inicialización
// ===============================


let articulosCache = []; // Variable global para la búsqueda
let detalleFactura = []; // El "carrito" de artículos
let articuloActual = null; // Guardará el objeto del artículo seleccionado en el buscador

document.addEventListener("DOMContentLoaded", () => {  
    
    registrarEventos();
    refrescarVista();
    consultaExistencia();

    const inputBusqueda = document.getElementById("input-busqueda");
        
        if (inputBusqueda) {
            inputBusqueda.addEventListener("input", (e) => {
                const texto = e.target.value;
                
                // Filtramos usando la variable que ya tienes llena
                const filtrados = filtrarLista(datosInventario, texto);
                
                // Dibujamos la tabla con los resultados
                // IMPORTANTE: Pasa 'filtrados' directamente
                renderizarTablaExistencia(filtrados); 
            });
        }
});


// ===============================
// Eventos y formularios
// ===============================

function registrarEventos() {
    // Listener del formulario
    const formAlta = document.getElementById("formAltaArticulo");
    if (formAlta) {
        formAlta.addEventListener("submit", (e) => registrarNuevoArticulo(e));
    }

    // Listener para el modal de Entradas
    

    const inputBusqueda = document.getElementById("input-busqueda");
    
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase().trim();
            filtrarArticulos(texto);
        });
    }

}



// ===============================
// Funciones
// ===============================

function seleccionarArticulo(art) {

    articuloActual = art;
    const inputBusqueda = document.getElementById("input-busqueda");
    const contenedorSugerencias = document.getElementById("sugerencias-busqueda");
    const detallePresentacion = document.getElementById("detalle-presentacion");

    // 1. Ponemos el nombre en el input
    inputBusqueda.value = art.nombre_articulo;

    // 2. Limpiamos sugerencias
    contenedorSugerencias.innerHTML = "";

    // 3. Mostramos el detalle en el div de abajo (Punto 3 de tu solicitud)
    // Aquí puedes combinar nombre, presentación y contenido_empaque si gustas
    detallePresentacion.innerHTML = `
        <div class="p-2 bg-light rounded border-start border-primary border-4">
            <span class="fw-bold text-dark">Articulo:</span> ${art.nombre_articulo} <br>
            <span class="fw-bold text-primary">Presentación:</span> ${art.presentacion} 
            <small class="text-muted">(${art.contenido_empaque} unidades)</small>
        </div>
    `;

    // Opcional: Guardar el ID para procesar la entrada después
    inputBusqueda.dataset.idSeleccionado = art.id;
}



let datosInventario = [];

async function consultaExistencia() {
    try {
      
        datosInventario = await customFetch('/api/existencias'); 
        console.log(datosInventario);
        renderizarTablaExistencia(datosInventario);
    } catch (error) {
        // El error ya viene manejado por el catch de customFetch
        alert("No se pudo cargar el inventario: " + error.message);
    }
}

async function verDetalleLotes(idArticulo, nombreArticulo) {
    try {
        // 1. Antes de ir al backend, ya sabemos el nombre. ¡Pongámoslo!
        const modalTitle = document.getElementById('modalLotesLabel');
        if (modalTitle) {
            // Usamos el nombre que recibimos por parámetro
            modalTitle.innerHTML = `📋 Lotes: <span class="text-white fw-bold">${nombreArticulo}</span>`;
        }

        // 2. Ahora sí, pedimos los lotes (que solo traen números y fechas)
        const lotes = await customFetch(`/api/existencias/lotes/${idArticulo}`);
        
        const tbodyLotes = document.getElementById("tablaLotesCuerpo");
        tbodyLotes.innerHTML = ''; 

        if (!lotes || lotes.length === 0) {
            tbodyLotes.innerHTML = '<tr><td colspan="3" class="text-center">No hay lotes con existencias.</td></tr>';
        } else {
            lotes.forEach(l => {
                // Tu lógica de fecha (Opción B para que no salte de día)
                const d = new Date(l.fecha_caducidad);
                const dia = String(d.getUTCDate()).padStart(2, '0');
                const mes = d.toLocaleString('es-MX', { month: 'short', timeZone: 'UTC' }).replace('.', '');
                const anio = d.getUTCFullYear();
                const fechaFormat = `${dia}/${mes}/${anio}`;

                const fila = `
                    <tr>
                        <td><span class="fw-bold">${l.lote}</span></td>
                        <td>${fechaFormat}</td>
                        <td class="text-center">${l.cantidad_actual}</td>
                    </tr>
                `;
                tbodyLotes.insertAdjacentHTML('beforeend', fila);
            });
        }

        // 3. Mostramos el modal
        const modalElement = document.getElementById('modalLotes');
        const modalLotes = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalLotes.show();

    } catch (error) {
        console.error("Error al cargar detalles de lotes:", error);
    }
}
async function cargarReporteCaducidad() {
    try {
        const datos = await customFetch('/api/reporte-caducidad');
        const tbody = document.querySelector('#modalReporteCaducidad tbody');
        tbody.innerHTML = '';

        datos.forEach(item => {
            // --- INICIO OPCIÓN B ---
            const d = new Date(item.fecha_caducidad);
            
            // Usamos métodos UTC para ignorar el desfase de Chihuahua
            const dia = String(d.getUTCDate()).padStart(2, '0');
            // 'short' nos dará "may", "abr", etc.
            const mes = d.toLocaleString('es-MX', { month: 'short', timeZone: 'UTC' }).replace('.', '');
            const anio = d.getUTCFullYear();

            const fechaFormat = `${dia}/${mes}/${anio}`;
            // --- FIN OPCIÓN B ---

            // Lógica de colores (se mantiene igual)
            let badgeClass = 'bg-info';
            let rowClass = '';
            let textClass = 'text-dark';

            if (item.estado_alerta === 'VENCIDO') {
                badgeClass = 'bg-danger';
                rowClass = 'table-danger-light'; 
                textClass = 'text-danger fw-bold';
            } else if (item.estado_alerta === 'CRÍTICO') {
                badgeClass = 'bg-warning text-dark';
                textClass = 'text-warning fw-bold';
            }

            const fila = `
                <tr class="${rowClass}">
                    <td class="ps-3 fw-bold">${item.sku}</td>
                    <td>${item.articulo}</td>
                    <td><span class="badge bg-light text-dark">${item.lote}</span></td>
                    <td>${fechaFormat}</td>
                    <td class="${textClass}">${item.dias_restantes} días</td>
                    <td>${item.cantidad} pzas</td>
                    <td><span class="badge ${badgeClass} rounded-pill px-3">${item.estado_alerta}</span></td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', fila);
        });

       const modalElement = document.getElementById('modalReporteCaducidad');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();

  
    } catch (error) {
        console.error("Error al cargar reporte:", error);
    }
}



window.verDetalleLotes = verDetalleLotes;
window.cargarReporteCaducidad = cargarReporteCaducidad;