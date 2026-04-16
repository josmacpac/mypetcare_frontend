import { customFetch } from './sesion.js';

export async function crearArticulo(formElement) {
    // 1. Extraemos y convertimos los datos en un solo lugar
    const formData = new FormData(formElement);
    const datosRaw = Object.fromEntries(formData.entries());

    const articulo = {
        ...datosRaw,
        // Convertimos los IDs a enteros
        categoria_articulo: parseInt(datosRaw.categoria_articulo),
        presentacion: parseInt(datosRaw.presentacion),
        // Los que ya tenías
        stock_minimo: parseInt(datosRaw.stock_minimo) || 0,
        precio_venta: parseFloat(datosRaw.precio_venta) || 0,
        contenido_empaque: parseInt(datosRaw.contenido_empaque) || 1
    };

    // 2. Enviamos al servidor
    return await customFetch('/api/articulos', 'POST', articulo);
}

export async function obtenerArticulos() {
    console.log("obteniendo articulos")
    try {
        // Usamos tu customFetch para traer los datos
        const data = await customFetch('/api/articulos', 'GET');
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error al obtener artículos:", error);
        return [];
    }
}

// --- Lógica de Interfaz (Render) ---
export function rellenarTablaArticulos(respuesta) {
    console.log("rellenar tabla");
    console.log(respuesta);
    const tbody = document.getElementById('tablaArticulos');
    tbody.innerHTML = ''; 

    const articulos = respuesta.data || [];

    articulos.forEach(art => {
        const fila = document.createElement('tr');
        
        // Accedemos a los alias que definimos en el backend
        // Si por alguna razón falla el join, mostramos el ID como respaldo
        const categoria = art.cat_info?.nombre_categoria || `ID: ${art.categoria_articulo}`;
        const presentacion = art.pres_info?.presentacion || `ID: ${art.presentacion}`;

        fila.innerHTML = `
            <td class="ps-3 fw-bold">${art.sku}</td>
            <td>${art.nombre_articulo}</td>
            <td>${presentacion}</td>
            <td>
                <span class="badge bg-info-subtle text-info rounded-pill px-3">
                    ${categoria}
                </span>
            </td>
            <td class="text-center">${art.contenido_empaque}</td>
            <td class="text-center">${art.stock_minimo}</td>
            <td class="fw-bold text-primary">$${parseFloat(art.precio_venta).toFixed(2)}</td>
            <td class="text-end pe-3">
                <button class="btn btn-sm btn-light text-primary rounded-circle me-1" onclick="prepararEdicion('${art.sku}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-light text-danger rounded-circle" onclick="confirmarEliminar('${art.sku}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}
