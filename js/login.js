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
    return; // Detenemos la ejecución si los datos son incorrectos
  }

  // 2. Si el login fue exitoso, verificamos el ROL en la tabla 'perfiles'
  const userId = data.user.id;
  console.log(userId)
  
  const { data: usuarioDb, error: dbError } = await supabase
    .from('usuarios') // <--- Cambiado a tu tabla 'usuarios'
    .select('rol')
    .eq('id_usuario', userId) // <--- O 'id', según tu estructura
    .limit(1);



  if (dbError || !usuarioDb) {
    console.error("No se pudo obtener el perfil:", dbError);
    // Si no hay perfil, lo mandamos a unauthorized por seguridad
    //window.location.href = './unauthorized.html';
    console.log("unauthorized, no se obtuvo datos del rol");
    return;
  }

  // 3. Lógica de redirección basada en el rol
  console.log("Rol detectado:", usuarioDb[0].rol);

  if (usuarioDb[0].rol === 102) {
    window.location.href = './index.html';
    console.log("acceso autorizado, es administrador");
  } else {
    window.location.href = './unauthorized.html';
    console.log("unauthorized");
  }
});