import { crearArticulo, obtenerArticulos, rellenarTablaArticulos } from "./articulos.js";
import { customFetch } from './sesion.js';

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