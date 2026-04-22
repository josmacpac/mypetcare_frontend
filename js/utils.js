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