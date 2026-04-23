import { customFetch } from './sesion.js';



export function filtrarLista(lista, termino) {
    const busqueda = termino.toLowerCase().trim();
    if (!busqueda) return lista;

    return lista.filter(item => {
        // Función interna para buscar en todos los niveles del objeto
        const buscarCampo = (valor) => {
            if (valor === null || valor === undefined) return false;
            
            // Si el valor es un objeto (como cat_info), buscamos dentro de él
            if (typeof valor === 'object' && !Array.isArray(valor)) {
                return Object.values(valor).some(v => buscarCampo(v));
            }
            
            // Si es texto o número, comparamos
            return String(valor).toLowerCase().includes(busqueda);
        };
        
        return buscarCampo(item);
    });
}

export function renderizarTablaExistencia(datos) {
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
                    <button class="btn btn-sm btn-outline-primary" onclick="verDetalleLotes(${item.id}, '${item.articulo}')">
                        🔍 Lotes
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', fila);
    });
}


export async function refrescarVista() {
    const listaArticulos = await obtenerArticulos();
    articulosCache = listaArticulos.data || listaArticulos;// Guardamos una copia para la búsqueda rápida
    rellenarTablaArticulos(listaArticulos);
}

export async function obtenerProveedoresAPI() {
    try {
        const resultado = await customFetch('/api/proveedores', 'GET');
        
        
        imprimirProveedores(resultado.data); 
        
        
    } catch (error) {
        console.error("Error al obtener proveedores", error);
    }
}



export function renderizarTablaTemporal() {
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