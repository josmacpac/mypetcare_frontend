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