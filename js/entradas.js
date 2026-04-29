import { obtenerArticulos } from "./articulos.js";
import {obtenerProveedoresAPI} from "./utils.js";
import { customFetch } from "./sesion.js";

let articuloSeleccionado = null;
let articulosCache = [];
let proveedorSeleccionado = null;
let idClinicaSeleccionada = null;
let listaArticulosTemporal = [];

   // 1. Referencias de los elementos de la Cabecera
    const inputFactura = document.getElementById('input-factura');
    const inputFechaCompra = document.getElementById('input-fecha-compra');
    
    // 2. Referencias de Búsqueda y Detalle de Artículo
    const inputBusqueda = document.getElementById('input-busqueda-articulo');
    const sugerenciasBusqueda = document.getElementById('sugerencias-busqueda');
    const detallePresentacion = document.getElementById('detalle-presentacion');

    // 3. Referencias de Captura de Ítems
    const inputCantidad = document.getElementById('input-cantidad');
    const inputCosto = document.getElementById('input-costo');
    const inputLote = document.getElementById('input-lote');
    const inputCaducidad = document.getElementById('input-caducidad');
    const btnAgregarItem = document.getElementById('btn-agregar-item');

    // 4. Referencias de la Tabla y Totales
    const displayTotal = document.getElementById('total-factura-display');

    // 5. Botones de Acción Final
    const btnGuardarTodo = document.getElementById('guardarFactura');
    const modalEntrada = document.getElementById('modalEntrada');

    // --- ASIGNACIÓN DE LISTENERS ---

    // Búsqueda en tiempo real (Autocomplete)
    if (inputBusqueda) {
    inputBusqueda.addEventListener('input', async (e) => {
        const query = e.target.value.trim().toLowerCase();
        console.log("🔍 Escribiendo en buscador:", query);
        if (query.length < 2) {
            sugerenciasBusqueda.innerHTML = '';
            return;
        }

        if (articulosCache.length === 0) {
            console.log("🔌 Llamando a obtenerArticulos()...");
            const data = await obtenerArticulos();
            articulosCache = data.data || data;
            console.log("📦 Cache cargado con:", articulosCache.length, "artículos");
            console.log(articulosCache)
        }

        const filtrados = articulosCache.filter(art => 
            art.nombre_articulo.toLowerCase().includes(query)
        ).slice(0, 5);

        renderizarSugerencias(filtrados, { sugerenciasBusqueda, inputBusqueda, detallePresentacion });
    });
}

    // Detectar selección de una sugerencia (Delegación de eventos)
   if (sugerenciasBusqueda) {
    sugerenciasBusqueda.addEventListener('click', (e) => {
        console.log("🖱️ Clic detectado en contenedor de sugerencias");
        const item = e.target.closest('.list-group-item');
        
        if (item) {
            // Obtenemos el objeto del cache comparando nombres o IDs
            const nombreArt = item.querySelector('.fw-bold').innerText;
            const articulo = articulosCache.find(a => a.nombre_articulo === nombreArt);
            
            console.log("✅ Artículo seleccionado:", articulo);
            seleccionarArticulo(articulo);
        }
    });
}

if (modalEntrada) {
    // Escuchamos directamente el evento de Bootstrap
    modalEntrada.addEventListener('show.bs.modal', function (event) {
        console.log("🚀 El modal se está abriendo!");
        
        // Ejecutamos tus funciones
        inicializarContextoClinica();
        cargarProveedores();
    });
} else {
    console.error("❌ ERROR: No existe un elemento con ID 'modalEntrada' en el HTML.");
}

    // Botón para agregar artículo a la lista temporal
    // Listener minimalista
btnAgregarItem.addEventListener('click', agregarArticuloALista);



    // Botón Guardar Factura Final
   btnGuardarTodo.addEventListener('click', guardarFactura);




    /* FUNCIONES */

    function agregarArticuloALista() {
    // 1. Captura de inputs
    const inputCantidad = document.getElementById('input-cantidad');
    const inputCosto = document.getElementById('input-costo');
    const inputLote = document.getElementById('input-lote');
    const inputCaducidad = document.getElementById('input-caducidad');

    // 2. Validaciones de negocio
    if (!articuloSeleccionado) {
        alert("⚠️ Debes seleccionar un artículo del buscador.");
        return;
    }

    const cantidad = parseFloat(inputCantidad.value);
    const costo = parseFloat(inputCosto.value);

    if (isNaN(cantidad) || cantidad <= 0 || isNaN(costo) || costo <= 0) {
        alert("⚠️ Cantidad y Costo deben ser valores numéricos mayores a 0.");
        return;
    }

    // 3. Creación del objeto (Estructura para el Backend)
    const nuevoItem = {
        id_articulo: articuloSeleccionado.id,
        nombre: articuloSeleccionado.nombre_articulo, // Para la vista
        cantidad: cantidad,
        costo_unitario: costo,
        lote: inputLote.value.trim() || 'S/L',
        caducidad: inputCaducidad.value || null,
        subtotal: cantidad * costo,
        id_clinica: idClinicaSeleccionada // Incluimos el ID que rescatamos del login
    };

    // 4. Guardar en el array global
    listaArticulosTemporal.push(nuevoItem);

    // 5. Orquestar cambios en la interfaz
    renderizarTablaTemporal();
    limpiarFormularioDetalle();
    
    console.log("📦 Producto añadido. Total de items:", listaArticulosTemporal.length);
    console.log(listaArticulosTemporal)
}

function renderizarTablaTemporal() {
    const tbody = document.getElementById('tbody-articulos-temporal');
    const contenedorTotal = document.getElementById('total-factura-display');
    
    tbody.innerHTML = '';
    let granTotal = 0;

    listaArticulosTemporal.forEach((item, index) => {
        granTotal += item.subtotal;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td class="text-center">${item.cantidad}</td>
            <td><span class="badge bg-secondary">${item.lote}</span></td>
            <td>${item.caducidad || '-'}</td>
            <td class="fw-bold">$${item.subtotal.toFixed(2)}</td>
            <td class="text-end">
                <button class="btn btn-outline-danger btn-sm" onclick="quitarItem(${index})">
                    <i class="bi bi-x-lg"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });

    // Actualizar el total visible
    if (contenedorTotal) {
        contenedorTotal.textContent = `$${granTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    }
}

function limpiarFormularioDetalle() {
    // Limpiar inputs
    document.getElementById('input-busqueda-articulo').value = '';
    document.getElementById('input-cantidad').value = '';
    document.getElementById('input-costo').value = '';
    document.getElementById('input-lote').value = '';
    document.getElementById('input-caducidad').value = '';

    // Resetear variable de selección
    articuloSeleccionado = null;

    // Regresar el foco al buscador
    document.getElementById('input-busqueda-articulo').focus();
}

// Función global para el botón de eliminar de la fila
window.quitarItem = (index) => {
    listaArticulosTemporal.splice(index, 1);
    renderizarTablaTemporal();
};

function inicializarContextoClinica() {
    // Extraemos el dato del localStorage
    const idGuardado = localStorage.getItem('clinica_id_actual');

    if (idGuardado) {
        // Convertimos a número por seguridad (Supabase prefiere ints para IDs)
        idClinicaSeleccionada = parseInt(idGuardado);
        console.log("✅ Contexto de clínica cargado:", idClinicaSeleccionada);
    } else {
        // Si por alguna razón no está (ej. borraron caché), protegemos el sistema
        console.error("❌ No se encontró el ID de la clínica en la sesión.");
        alert("Su sesión ha expirado o no tiene una clínica vinculada. Por favor, inicie sesión de nuevo.");
        window.location.href = 'login.html';
    }
}

// 2. Ejecutar la función de inmediato al cargar el script


function renderizarSugerencias(articulos) {
    sugerenciasBusqueda.innerHTML = '';
    articulos.forEach(art => {
        const btn = document.createElement('button');
        btn.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        btn.type = 'button';
        // Guardamos el ID en un dataset por si lo necesitas
        btn.dataset.id = art.id; 
        btn.innerHTML = `
            <div>
                <div class="fw-bold text-dark">${art.nombre_articulo}</div>
            </div>
      
        `;
        sugerenciasBusqueda.appendChild(btn);
    });
}

function seleccionarArticulo(articulo) {
    if (!articulo) return;
    articuloSeleccionado = articulo;
    
    detallePresentacion.innerHTML = `<strong>Artículo:</strong> ${articulo.nombre_articulo} | <strong>Presentación:</strong> ${articulo.presentacion || 'N/A'}`;
    document.getElementById('input-costo').value = articulo.precio_costo || '';
    
    inputBusqueda.value = '';
    sugerenciasBusqueda.innerHTML = '';
    document.getElementById('input-cantidad').focus();
}

function imprimirProveedores(proveedores) {
    const selectProveedor = document.getElementById('select-proveedor');
    console.log("imprimiendo proveedores", proveedores, selectProveedor);
    if (!selectProveedor) return;

    selectProveedor.innerHTML = '<option value="" selected disabled>Seleccione un proveedor...</option>';
    
    proveedores.forEach(prov => {
        const option = document.createElement('option');
        option.value = prov.id; 
        option.textContent = prov.nombre_proveedor;
        selectProveedor.appendChild(option);
    });
    selectProveedor.onchange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        
        proveedorSeleccionado = e.target.value
        
        
        console.log("📍 Proveedor seleccionado y guardado:", proveedorSeleccionado);
    };
}

async function cargarProveedores() {
    const lista = await obtenerProveedoresAPI();
    console.log("funcion cargar proveedores");
    console.log(lista)
    imprimirProveedores(lista);
}

/**
 * Procesa la validación y el envío de la factura al Backend
 */
async function guardarFactura() {
    // 1. Validaciones de Negocio
    if (listaArticulosTemporal.length === 0) {
        alert("⚠️ No hay artículos en la lista para guardar.");
        return;
    }

    if (!proveedorSeleccionado) {
        alert("⚠️ Debes seleccionar un proveedor.");
        return;
    }

    const facturaNo = inputFactura.value.trim();
    if (!facturaNo) {
        alert("⚠️ El número de factura es obligatorio.");
        return;
    }

    // 2. Construcción del Payload (Estructura para Flask)
    const payload = {
        cabecera: {
            id_proveedor: parseInt(proveedorSeleccionado),
            no_factura: facturaNo,
            total_factura: listaArticulosTemporal.reduce((acc, item) => acc + item.subtotal, 0),
            fecha_compra: inputFechaCompra.value,
            id_clinica: idClinicaSeleccionada 
        },
        items: listaArticulosTemporal.map(item => ({
            articulo_id: item.id_articulo,
            cantidad: item.cantidad,
            costo_unitario: item.costo_unitario,
            lote: item.lote,
            fecha_caducidad: item.caducidad 
        }))
    };

    // 3. Ejecución de la petición
    try {
        console.log("🚀 Enviando factura al API...");
        
        // Usamos tu customFetch que ya maneja Token y Base URL
        const resultado = await customFetch('/api/entradas', 'POST', payload);

        if (resultado.status === 'success') {
            alert(`✅ ${resultado.message}`);
            
            finalizarProcesoEntrada();
        }

    } catch (error) {
        // El error ya viene formateado desde tu customFetch
        alert("❌ Error al registrar: " + error.message);
    }
}

/**
 * Limpia la interfaz y cierra el modal tras un guardado exitoso
 */
function finalizarProcesoEntrada() {
    // Vaciar lista y refrescar tabla
    listaArticulosTemporal = [];
    renderizarTablaTemporal();
    
    // Resetear formulario de cabecera
    const form = document.getElementById('formCapturaEntrada'); 
    if (form) form.reset();
    
    // Resetear variables de estado
    proveedorSeleccionado = null;
    articuloSeleccionado = null;
    if (detallePresentacion) detallePresentacion.innerHTML = '';

    // Cerrar modal
    const elModal = document.getElementById('modalEntrada');
    const modalInstancia = bootstrap.Modal.getInstance(elModal);
    if (modalInstancia) modalInstancia.hide();
}