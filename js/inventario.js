import { crearArticulo, obtenerArticulos, rellenarTablaArticulos } from "./articulos.js";
import { customFetch } from './sesion.js';

// ===============================
// Inicialización
// ===============================

let articulosCache = []; // Variable global para la búsqueda

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