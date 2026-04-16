import { crearArticulo, obtenerArticulos, rellenarTablaArticulos } from "./articulos.js";
import { customFetch } from './sesion.js';
// ===============================
// Inicialización
// ===============================
window.eliminarRenglon = eliminarRenglon;

let articulosCache = []; // Variable global para la búsqueda
let detalleFactura = []; // El "carrito" de artículos
let articuloActual = null; // Guardará el objeto del artículo seleccionado en el buscador

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
    // Listener del formulario
    const formAlta = document.getElementById("formAltaArticulo");
    if (formAlta) {
        formAlta.addEventListener("submit", (e) => registrarNuevoArticulo(e));
    }

    // Listener para el modal de Entradas
    const modalEntrada = document.getElementById("modalEntrada"); 
    
    if (modalEntrada) {
        // El evento debe ser 'show.bs.modal'
        modalEntrada.addEventListener("show.bs.modal", () => {
            console.log("El modal se está abriendo ahora mismo...");
            obtenerProveedoresAPI();
        });
    } else {
        console.error("No se encontró el elemento con ID 'modalEntrada'");
    }

    const inputBusqueda = document.getElementById("input-busqueda");
    
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase().trim();
            filtrarArticulos(texto);
        });
    }

    document.getElementById("btn-agregar-item").addEventListener("click", () => {
        const cant = document.getElementById("input-cantidad").value;
        const costo = document.getElementById("input-costo").value;
        const lote = document.getElementById("input-lote").value;
        const vence = document.getElementById("input-caducidad").value;

        // Validaciones básicas
        if (!articuloActual || !cant || !costo) {
            alert("Seleccione un artículo, cantidad y costo.");
            return;
        }

        // Creamos el objeto del renglón
        const item = {
            articulo_id: articuloActual.id,
            nombre: articuloActual.nombre_articulo,
            presentacion: articuloActual.presentacion,
            cantidad: parseInt(cant),
            costo_unitario: parseFloat(costo),
            lote: lote,
            fecha_caducidad: vence,
            subtotal: parseInt(cant) * parseFloat(costo)
        };

        // Lo agregamos a nuestra lista temporal
        detalleFactura.push(item);
        
        // Actualizamos la tabla y limpiamos el área de captura
        renderizarTablaTemporal();
        limpiarFormularioCaptura();
    });



}

// ===============================
// Funciones
// ===============================

async function refrescarVista() {
    const listaArticulos = await obtenerArticulos();
    articulosCache = listaArticulos.data || listaArticulos;// Guardamos una copia para la búsqueda rápida
    rellenarTablaArticulos(listaArticulos);
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


async function obtenerProveedoresAPI() {
    try {
        const resultado = await customFetch('/api/proveedores', 'GET');
        const resultadoLab = await customFetch('/api/laboratorio', 'GET')
        
        
        imprimirProveedores(resultado.data, resultadoLab.data); 
        
        
    } catch (error) {
        console.error("Error al obtener proveedores/lab:", error);
    }
}


function imprimirProveedores(listaProveedores, listaLaboratorio) {
    const select = document.getElementById("select-proveedor");
    const selectLab = document.getElementById("select-lab");
    console.log("Datos recibidos:", listaProveedores, listaLaboratorio); // Revisa qué nombres de propiedades tienen los objetos
    
    if (!select) {
        console.error("No se encontró el select con id 'select-proveedor'");
        return;
    }

    select.innerHTML = '<option value="" selected disabled>Seleccione un proveedor</option>';
    selectLab.innerHTML = '<option value="" selected disabled>Seleccione un Laboratorio</option>';

    listaProveedores.forEach(prov => {
        const option = document.createElement("option");
        option.value = prov.id; 
        option.textContent = prov.nombre_proveedor || prov.RFC || "Sin nombre"; 
        select.appendChild(option);
    });

    listaLaboratorio.forEach(lab => {
        const optionLab = document.createElement("option");
        optionLab.value = lab.id; 
        optionLab.textContent = lab.nombre_laboratorio || "Sin nombre"; 
        selectLab.appendChild(optionLab);
    });


}

function filtrarArticulos(termino) {
    const contenedor = document.getElementById("sugerencias-busqueda");
    
    if (!termino) {
        contenedor.innerHTML = "";
        return;
    }

    // Filtramos en la variable global que llenamos en refrescarVista
    const coincidencias = articulosCache.filter(art => 
        art.nombre_articulo.toLowerCase().includes(termino)
    );

    contenedor.innerHTML = "";

    coincidencias.slice(0, 5).forEach(art => {
        const item = document.createElement("button");
        item.classList.add("list-group-item", "list-group-item-action", "border-0", "shadow-sm", "mb-1");
        
        // Mostramos Nombre y Presentación en la sugerencia
        item.textContent = `${art.nombre_articulo} - ${art.presentacion}`;
        
        item.onclick = (e) => {
            e.preventDefault();
            seleccionarArticulo(art);
        };
        
        contenedor.appendChild(item);
    });
}


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
    console.log("Artículo listo para agregar:", articuloActual);
}


function renderizarTablaTemporal() {
    const tabla = document.getElementById("listaTemporalEntrada");
    tabla.innerHTML = ""; // Limpiar tabla
    let granTotal = 0;

    detalleFactura.forEach((item, index) => {
        granTotal += item.subtotal;
        
        const fila = `
            <tr class="small">
                <td class="fw-bold">${item.nombre} <br> <small class="text-muted">${item.presentacion}</small></td>
                <td>${item.cantidad}</td>
                <td>${item.lote || 'N/A'}</td>
                <td>${item.fecha_caducidad || 'N/A'}</td>
                <td>$${item.subtotal.toLocaleString()}</td>
                <td>
                    <button class="btn btn-link btn-sm text-danger p-0" onclick="eliminarRenglon(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
        tabla.insertAdjacentHTML('beforeend', fila);
    });

    // Actualizar el texto del Total en el footer del modal
    document.querySelector(".h5.fw-bold.text-primary").textContent = `Total: $${granTotal.toLocaleString()}`;
}


async function enviarFacturaAPI() {
    if (detalleFactura.length === 0) {
        alert("La lista de artículos está vacía.");
        return;
    }

    const payload = {
        no_factura: document.getElementById("input-factura").value,
        id_proveedor: document.getElementById("select-proveedor").value,
        id_laboratorio: document.getElementById("select-lab").value,
        items: detalleFactura, // Aquí va todo el array capturado
        total_factura: detalleFactura.reduce((acc, item) => acc + item.subtotal, 0)
    };

    try {
        // Usando tu función customFetch
        const response = await customFetch('api/entradas', 'POST', payload);
        
        if(response.status === "success") {
            alert("¡Factura guardada correctamente!");
            // Limpiar todo y cerrar el modal
            detalleFactura = [];
            document.getElementById("formCapturaEntrada").reset();
            bootstrap.Modal.getInstance(document.getElementById('modalEntrada')).hide();
            refrescarVista(); 
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
}


/**
 * Elimina un artículo del array temporal y refresca la tabla
 * @param {number} index - La posición del elemento en el array detalleFactura
 */
function eliminarRenglon(index) {
    // 1. Confirmación simple (opcional)
    // if (!confirm("¿Deseas quitar este artículo de la lista?")) return;

    // 2. Eliminamos el elemento del array usando su índice
    detalleFactura.splice(index, 1);

    // 3. Volvemos a dibujar la tabla para que se refleje el cambio y se recalcule el total
    renderizarTablaTemporal();
    
    console.log("Artículo eliminado. Quedan: " + detalleFactura.length);
}


function limpiarFormularioCaptura() {
    articuloActual = null; // Resetear la referencia
    document.getElementById("input-busqueda").value = "";
    document.getElementById("input-cantidad").value = "";
    document.getElementById("input-costo").value = "";
    document.getElementById("input-lote").value = "";
    document.getElementById("input-caducidad").value = "";
    document.getElementById("detalle-presentacion").innerHTML = '<p class="text-muted small">Articulo : presentacion : ---</p>';
    
    // Devolvemos el foco al buscador para el siguiente artículo
    document.getElementById("input-busqueda").focus();
}