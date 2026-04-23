import { crearArticulo, obtenerArticulos, rellenarTablaArticulos } from "./articulos.js";
import { filtrarLista, renderizarTablaExistencia } from './utils.js';
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
    const modalEntrada = document.getElementById("modalEntrada"); 
    
    if (modalEntrada) {
        // El evento debe ser 'show.bs.modal'
        modalEntrada.addEventListener("show.bs.modal", () => {
            
            obtenerProveedoresAPI();
        });
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

const btnGuardar = document.getElementById("guardarFactura");
if (btnGuardar) {
    btnGuardar.addEventListener("click", async () => {
        // Validación rápida antes de procesar
        if (detalleFactura.length === 0) {
            alert("No hay artículos agregados a la factura.");
            return;
        }
        
        // Confirmación del usuario
        if (confirm("¿Estás seguro de que deseas guardar esta factura y registrar la entrada?")) {
            await ejecutarGuardadoFactura();
        }
    });
}


const btnCancelar = document.getElementById("btnCancelarEntrada");
if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
        if (confirm("¿Estás seguro? Se perderán todos los artículos capturados en esta factura.")) {
            limpiarTodoPostGuardado();
        }
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
        
        
        imprimirProveedores(resultado.data); 
        
        
    } catch (error) {
        console.error("Error al obtener proveedores", error);
    }
}


function imprimirProveedores(listaProveedores) {
    const select = document.getElementById("select-proveedor");
        
    if (!select) {
        console.error("No se encontró el select con id 'select-proveedor'");
        return;
    }

    select.innerHTML = '<option value="" selected disabled>Seleccione un proveedor</option>';

    listaProveedores.forEach(prov => {
        const option = document.createElement("option");
        option.value = prov.id; 
        option.textContent = prov.nombre_proveedor || prov.RFC || "Sin nombre"; 
        select.appendChild(option);
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

function validarFactura() {
    const campos = {
        factura: document.getElementById("input-factura")?.value,
        proveedor: document.getElementById("select-proveedor").value,
        fecha: document.getElementById("input-fecha-compra").value
    };

    // 1. Validar Cabecera
    if (!campos.proveedor || campos.proveedor === "" || isNaN(parseInt(campos.proveedor))) {
        alert("⚠️ Por favor, selecciona un proveedor.");
        return false;
    }
    if (!campos.fecha) {
        alert("⚠️ La fecha de compra es obligatoria.");
        return false;
    }
    if (!campos.factura) {
        alert("⚠️ El número de factura es necesario (usa 'S/N' si no tiene).");
        return false;
    }

    // 2. Validar que existan artículos
    if (detalleFactura.length === 0) {
        alert("⚠️ No puedes guardar una factura sin artículos. Agrega al menos uno.");
        return false;
    }

    // 3. Validar consistencia de los artículos (opcional pero recomendado)
    const itemsInvalidos = detalleFactura.some(item => !item.cantidad || item.cantidad <= 0 || !item.costo_unitario);
    if (itemsInvalidos) {
        alert("⚠️ Algunos artículos en la lista tienen cantidad o costo inválido.");
        return false;
    }

    return true; // Todo está bien
}

async function ejecutarGuardadoFactura() {

    if (!validarFactura()) return;
    // 1. Recolectamos datos de los elementos del DOM
    const noFactura = document.querySelector('input[placeholder*="Factura"]').value;
    const idProveedor = document.getElementById("select-proveedor").value;
    const fechaCompra = document.getElementById("input-fecha-compra").value;
    // Calculamos el monto total de la factura basándonos en el array temporal
    const totalTexto = document.getElementById("total-factura-display").textContent;
    const montoTotal = parseFloat(totalTexto.replace(/[^\d.]/g, ""));

    // 2. Armamos el objeto exactamente como lo espera el endpoint de Flask
   const payload = {
        cabecera: {
            no_factura: noFactura,
            id_proveedor: idProveedor,
            fecha_compra: fechaCompra,
            total_factura: montoTotal // <--- Enviamos exactamente lo que el usuario ve
        },
        items: detalleFactura 
    };
    
    try {
        // 3. Enviamos usando tu función centralizada
        const resultado = await customFetch('/api/entradas', 'POST', payload);

        if (resultado.status === "success") {
            alert("¡Factura guardada con éxito!");
            
            // 4. Limpieza post-guardado
            limpiarTodoPostGuardado();
        }
    } catch (error) {
        alert("Error al guardar la factura: " + error.message);
    }
}


function limpiarTodoPostGuardado() {
    // 1. Vaciar el array temporal (El "carrito")
    detalleFactura = [];
    
    // 2. Limpiar la tabla visual del modal
    renderizarTablaTemporal();
    
    // 3. Resetear el formulario (Inputs y Selects de cabecera)
    const formulario = document.getElementById("formCapturaEntrada");
    if (formulario) formulario.reset();
    
    // 4. Limpiar datos del artículo en edición
    articuloActual = null;
    document.getElementById("detalle-presentacion").innerHTML = "Articulo : presentacion : ---";
    document.getElementById("sugerencias-busqueda").innerHTML = "";

    // 5. Cerrar el modal
    const modalElement = document.getElementById('modalEntrada');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
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

/* function renderizarTablaExistencia(datos) {
    const tbody = document.getElementById("tablaExistencias");
    tbody.innerHTML = '';

    datos.forEach(item => {
        // Lógica visual: si hay 0 existencia, mostrar 'Agotado'
        const stockDisplay = item.existencia === 0 ? 'AGOTADO' : item.existencia;
        const stockClass = item.existencia <= 5 ? 'fw-bold text-danger' : '';

        const fila = `
            <tr>
                <td>${item.sku}</td>
                <td>${item.articulo}</td>
                <td><span class="badge bg-secondary">${item.categoria}</span></td>
                <td class="${stockClass}">${stockDisplay}</td>
                <td>$${item.precio.toLocaleString('es-MX')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="verDetalleLotes(${item.id})">
                        🔍 Lotes
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', fila);
    });
}
 */
async function verDetalleLotes(idArticulo) {
    try {
        const lotes = await customFetch(`/api/existencias/lotes/${idArticulo}`);
        
        const tbodyLotes = document.getElementById("tablaLotesCuerpo");
        tbodyLotes.innerHTML = ''; 

        if (!lotes || lotes.length === 0) {
            tbodyLotes.innerHTML = '<tr><td colspan="3" class="text-center">No hay lotes con existencias.</td></tr>';
        } else {
            lotes.forEach(l => {
                const fecha = new Date(l.fecha_caducidad).toLocaleDateString('es-MX');
                const fila = `
                    <tr>
                        <td><span class="fw-bold">${l.lote}</span></td>
                        <td>${fecha}</td>
                        <td class="text-center">${l.cantidad_actual}</td>
                    </tr>
                `;
                tbodyLotes.insertAdjacentHTML('beforeend', fila);
            });
        }

        const modalElement = document.getElementById('modalLotes');
        const modalLotes = new bootstrap.Modal(modalElement);
        modalLotes.show();

    } catch (error) {
        console.error("Error al cargar detalles de lotes:", error);
    }
}
window.verDetalleLotes = verDetalleLotes;