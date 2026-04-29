import { supabase } from "./supabaseConfig.js";

const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 

  const email = document.querySelector('#email-input').value;
  const password = document.querySelector('#password-input').value;
  
  console.log("Intentando entrar con:", email);

  // 1. Autenticación en Supabase Auth
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    alert("Error de credenciales: " + authError.message);
    return;
  }

  const userId = data.user.id;

  // 2. Consulta combinada: Traemos el ROL de 'usuarios' 
  // y el ID_CLINICA de 'veterinarios_data'
  
  // Primero obtenemos el rol
  const { data: usuarioDb, error: dbError } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id_usuario', userId)
    .single();

  // Luego obtenemos la clínica vinculada al veterinario (UUID)
  const { data: veteData, error: veteError } = await supabase
    .from('veterinarios_data')
    .select('id_clinica')
    .eq('id', userId) // Usamos el UUID que viene del Auth
    .single();

  if (dbError || veteError || !usuarioDb || !veteData) {
    console.error("Error al obtener datos de perfil o clínica");
    alert("Error al configurar la sesión de la clínica.");
    return;
  }

  // 3. GUARDADO EN STORAGE (La "llave" para tus módulos)
  localStorage.setItem('clinica_id_actual', veteData.id_clinica);
  localStorage.setItem('rol_usuario', usuarioDb.rol);
  // Opcional: guardar nombre para mostrar un saludo
  localStorage.setItem('sesion_activa', 'true');

  console.log("Sesión configurada para Clínica:", veteData.id_clinica);

  // 4. Lógica de redirección basada en el rol
  if (usuarioDb.rol === 102) {
    console.log("Acceso autorizado como administrador");
    window.location.href = './index.html';
  } else {
    console.warn("Rol insuficiente");
    window.location.href = './unauthorized.html';
  }
});