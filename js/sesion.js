// sesion.js
import { supabase } from './supabaseConfig.js';

export async function configurarInterfazUsuario() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data } = await supabase
            .from('usuarios')
            .select('nombre')
            .eq('id_usuario', user.id)
            .single();

        const nombreElemento = document.getElementById('userName');
        if (nombreElemento && data) {
            nombreElemento.textContent = data.nombre;
        }
    }

    // Configurar el botón de Logout si existe en el DOM actual
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.onclick = async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        };
    }
}

// Opcional: Ejecutar automáticamente al cargar el script
configurarInterfazUsuario();


// Este archivo centraliza todas las peticiones al backend
export async function customFetch(endpoint, method = 'GET', body = null) {
    const url = endpoint; // Aquí puedes concatenar una BASE_URL si la tienes
    
    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Descomenta si usas JWT
        }
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Error en la petición');
        }
        
        return result;
    } catch (error) {
        console.error("Error API:", error);
        throw error;
    }
}