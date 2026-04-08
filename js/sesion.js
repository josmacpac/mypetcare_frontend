// sesion.js
import { supabase } from './supabaseConfig.js';

const BASE_URL = "http://localhost:5000";

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

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token; // Este es el JWT que espera Flask
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
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