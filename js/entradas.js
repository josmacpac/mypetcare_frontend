import { obtenerArticulos } from "./articulos.js";
import {obtenerProveedoresAPI} from "./utils.js";

console.log("✅ Archivo modal.js cargado correctamente");

let articuloSeleccionado = null;
let articulosCache = [];
let proveedorSeleccionado = null;

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
    const tablaTemporal = document.getElementById('listaTemporalEntrada');
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

    // Botón para agregar artículo a la lista temporal
    btnAgregarItem.addEventListener('click', () => {
        console.log('Validando y agregando ítem a la tabla...');
        // Aquí validarías que los campos no estén vacíos antes de insertar en la tabla
    });

    // Eliminar ítem de la tabla (Delegación de eventos)
    tablaTemporal.addEventListener('click', (e) => {
        if (e.target.closest('.btn-eliminar')) {
            const fila = e.target.closest('tr');
            fila.remove();
            console.log('Ítem eliminado de la lista');
            // Aquí llamarías a una función para recalcular el total
        }
    });

    // Botón Guardar Factura Final
    btnGuardarTodo.addEventListener('click', () => {
        console.log('Iniciando proceso de guardado de toda la factura...');
        // Recolectar datos de cabecera + array de la tabla y enviar al servidor
    });

    // Limpiar formulario cuando el modal se cierre
    modalEntrada.addEventListener('hidden.bs.modal', () => {
        console.log('Limpiando formulario...');
        document.getElementById('formCapturaEntrada').reset();
        tablaTemporal.innerHTML = '';
        displayTotal.innerText = 'Total: $0.00';
    });

    modalEntrada.addEventListener('show.bs.modal', () => {
        console.log("se abrio modal de entrada");
     cargarProveedores();
});




    /* FUNCIONES */

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