import { supabase } from './supabaseConfig.js';

async function checkAuth() {
    // 1. Verificar sesión activa con el servidor
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("No hay sesión activa");
        window.location.href = 'login.html';
        return;
    }

    // 2. Verificar el Rol 102 en tu tabla usuarios
    const { data: usuarioDb, error: dbError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id_usuario', user.id)
        .single();

    if (dbError || !usuarioDb || usuarioDb.rol !== 102) {
        console.warn("Acceso denegado: Rol insuficiente");
        window.location.href = 'unauthorized.html';
        return;
    }

    // 3. Si todo está bien, mostramos el contenido
    document.documentElement.style.display = 'block';
    console.log("Bienvenido, Administrador");
}

checkAuth();