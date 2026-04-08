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