import { customFetch } from './sesion.js';

/**
 * Envía un nuevo artículo al backend
 * @param {Object} datosRaw - Datos directos del formulario
 */
export async function crearArticulo(datosRaw) {
    // 1. Preparamos los datos (Conversión de tipos)
    // Es importante porque los inputs de HTML siempre devuelven strings
    const articulo = {
        ...datosRaw,
        stock_minimo: parseInt(datosRaw.stock_minimo) || 0,
        precio_venta: parseFloat(datosRaw.precio_venta) || 0,
        contenido_empaque: parseInt(datosRaw.contenido_empaque) || 1
    };

    // 2. Usamos tu función reutilizable
    // Nota: El endpoint debe coincidir con tu ruta de Flask @articulos_pb.route('/articulos')
    return await customFetch('/api/articulos', 'POST', articulo);
}