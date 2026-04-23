function imprimirProveedores(listaProveedores) {
    const select = document.getElementById("select-proveedor");
        
    if (!select) {
        console.error("No se encontró el select con id 'select-proveedor'");
        return;
    }

    select.innerHTML = '<option value="" selected disabled>Seleccione un proveedor</option>';

    listaProveedores.forEach(prov => {
        const option = document.createElement("option");
        option.value = prov.id; 
        option.textContent = prov.nombre_proveedor || prov.RFC || "Sin nombre"; 
        select.appendChild(option);
    });



}

function validarFactura() {
    const campos = {
        factura: document.getElementById("input-factura")?.value,
        proveedor: document.getElementById("select-proveedor").value,
        fecha: document.getElementById("input-fecha-compra").value
    };

    // 1. Validar Cabecera
    if (!campos.proveedor || campos.proveedor === "" || isNaN(parseInt(campos.proveedor))) {
        alert("⚠️ Por favor, selecciona un proveedor.");
        return false;
    }
    if (!campos.fecha) {
        alert("⚠️ La fecha de compra es obligatoria.");
        return false;
    }
    if (!campos.factura) {
        alert("⚠️ El número de factura es necesario (usa 'S/N' si no tiene).");
        return false;
    }

    // 2. Validar que existan artículos
    if (detalleFactura.length === 0) {
        alert("⚠️ No puedes guardar una factura sin artículos. Agrega al menos uno.");
        return false;
    }

    // 3. Validar consistencia de los artículos (opcional pero recomendado)
    const itemsInvalidos = detalleFactura.some(item => !item.cantidad || item.cantidad <= 0 || !item.costo_unitario);
    if (itemsInvalidos) {
        alert("⚠️ Algunos artículos en la lista tienen cantidad o costo inválido.");
        return false;
    }

    return true; // Todo está bien
}

async function ejecutarGuardadoFactura() {

    if (!validarFactura()) return;
    // 1. Recolectamos datos de los elementos del DOM
    const noFactura = document.querySelector('input[placeholder*="Factura"]').value;
    const idProveedor = document.getElementById("select-proveedor").value;
    const fechaCompra = document.getElementById("input-fecha-compra").value;
    // Calculamos el monto total de la factura basándonos en el array temporal
    const totalTexto = document.getElementById("total-factura-display").textContent;
    const montoTotal = parseFloat(totalTexto.replace(/[^\d.]/g, ""));

    // 2. Armamos el objeto exactamente como lo espera el endpoint de Flask
   const payload = {
        cabecera: {
            no_factura: noFactura,
            id_proveedor: idProveedor,
            fecha_compra: fechaCompra,
            total_factura: montoTotal // <--- Enviamos exactamente lo que el usuario ve
        },
        items: detalleFactura 
    };
    
    try {
        // 3. Enviamos usando tu función centralizada
        const resultado = await customFetch('/api/entradas', 'POST', payload);

        if (resultado.status === "success") {
            alert("¡Factura guardada con éxito!");
            
            // 4. Limpieza post-guardado
            limpiarTodoPostGuardado();
        }
    } catch (error) {
        alert("Error al guardar la factura: " + error.message);
    }
}


function limpiarTodoPostGuardado() {
    // 1. Vaciar el array temporal (El "carrito")
    detalleFactura = [];
    
    // 2. Limpiar la tabla visual del modal
    renderizarTablaTemporal();
    
    // 3. Resetear el formulario (Inputs y Selects de cabecera)
    const formulario = document.getElementById("formCapturaEntrada");
    if (formulario) formulario.reset();
    
    // 4. Limpiar datos del artículo en edición
    articuloActual = null;
    document.getElementById("detalle-presentacion").innerHTML = "Articulo : presentacion : ---";
    document.getElementById("sugerencias-busqueda").innerHTML = "";

    // 5. Cerrar el modal
    const modalElement = document.getElementById('modalEntrada');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
}

    document.getElementById("btn-agregar-item").addEventListener("click", () => {
        const cant = document.getElementById("input-cantidad").value;
        const costo = document.getElementById("input-costo").value;
        const lote = document.getElementById("input-lote").value;
        const vence = document.getElementById("input-caducidad").value;

        // Validaciones básicas
        if (!articuloActual || !cant || !costo) {
            alert("Seleccione un artículo, cantidad y costo.");
            return;
        }

        // Creamos el objeto del renglón
        const item = {
            articulo_id: articuloActual.id,
            nombre: articuloActual.nombre_articulo,
            presentacion: articuloActual.presentacion,
            cantidad: parseInt(cant),
            costo_unitario: parseFloat(costo),
            lote: lote,
            fecha_caducidad: vence,
            subtotal: parseInt(cant) * parseFloat(costo)
        };

        // Lo agregamos a nuestra lista temporal
        detalleFactura.push(item);
        
        // Actualizamos la tabla y limpiamos el área de captura
        renderizarTablaTemporal();
        limpiarFormularioCaptura();
    });


    const btnGuardar = document.getElementById("guardarFactura");
if (btnGuardar) {
    btnGuardar.addEventListener("click", async () => {
        // Validación rápida antes de procesar
        if (detalleFactura.length === 0) {
            alert("No hay artículos agregados a la factura.");
            return;
        }
        
        // Confirmación del usuario
        if (confirm("¿Estás seguro de que deseas guardar esta factura y registrar la entrada?")) {
            await ejecutarGuardadoFactura();
        }
    });
}


const btnCancelar = document.getElementById("btnCancelarEntrada");
if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
        if (confirm("¿Estás seguro? Se perderán todos los artículos capturados en esta factura.")) {
            limpiarTodoPostGuardado();
        }
    });
}


function eliminarRenglon(index) {
    // 1. Confirmación simple (opcional)
    // if (!confirm("¿Deseas quitar este artículo de la lista?")) return;

    // 2. Eliminamos el elemento del array usando su índice
    detalleFactura.splice(index, 1);

    // 3. Volvemos a dibujar la tabla para que se refleje el cambio y se recalcule el total
    renderizarTablaTemporal();
    
}


function limpiarFormularioCaptura() {
    articuloActual = null; // Resetear la referencia
    document.getElementById("input-busqueda").value = "";
    document.getElementById("input-cantidad").value = "";
    document.getElementById("input-costo").value = "";
    document.getElementById("input-lote").value = "";
    document.getElementById("input-caducidad").value = "";
    document.getElementById("detalle-presentacion").innerHTML = '<p class="text-muted small">Articulo : presentacion : ---</p>';
    
    // Devolvemos el foco al buscador para el siguiente artículo
    document.getElementById("input-busqueda").focus();
}