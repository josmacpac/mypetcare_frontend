import { supabase } from "./supabaseConfig.js";

const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 

  const email = document.querySelector('#email-input').value;
  const password = document.querySelector('#password-input').value;
  
  // 1. Autenticación en Supabase Auth
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    alert("Error de credenciales: " + authError.message);
    return;
  }

  // 2. Extraer datos directamente del Metadata (evita errores de tablas externas)
  const idClinica = data.user.user_metadata.id_clinica;
  const rolUsuario = data.user.user_metadata.rol || 102; // Usa 102 por defecto si no está definido

  if (!idClinica) {
    alert("Error: El usuario no tiene una clínica asignada en su perfil de Auth.");
    return;
  }

  // 3. Obtener nombre de la clínica (Opcional, pero para mantener tu lógica de saludo)
  const { data: clinicaInfo } = await supabase
    .from('clinicas')
    .select('nombre_clinica')
    .eq('id', idClinica)
    .maybeSingle();

  const nombreClinica = clinicaInfo?.nombre_clinica || "Mi Clínica";

  // 4. GUARDADO EN STORAGE
  localStorage.setItem('clinica_nombre', nombreClinica);
  localStorage.setItem('clinica_id_actual', idClinica);
  localStorage.setItem('rol_usuario', rolUsuario);
  localStorage.setItem('sesion_activa', 'true');

  // 5. Lógica de redirección basada en el rol
  if (rolUsuario === 102) {
    window.location.href = './index.html';
  } else {
    window.location.href = './unauthorized.html';
  }
});