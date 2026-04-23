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
                    <button class="btn btn-sm btn-outline-primary" onclick="verDetalleLotes(${item.id})">
                        🔍 Lotes
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', fila);
    });
}
