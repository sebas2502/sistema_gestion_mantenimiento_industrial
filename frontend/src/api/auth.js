import api from './api'; // Importamos tu instancia base de Axios

/**
 * Envia las credenciales al backend para autenticar al usuario
 * @param {string} email 
 * @param {string} clave 
 */
export const iniciarSesion = async (email, clave) => {
  try {
    // Usamos la instancia existente. La URL se completa automáticamente.
    const respuesta = await api.post('/auth/login', { email, clave });
    
    // Axios ya parsea el JSON automáticamente en la propiedad .data
    const datos = respuesta.data;

    // Guardamos el token criptográfico y el objeto usuario en el storage local
    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));

    return datos;
  } catch (error) {
    // Si el backend responde con un error estructurado, lo capturamos acá
    if (error.response && error.response.data) {
      throw new Error(error.response.data.mensaje || 'Error al iniciar sesión.');
    }
    throw new Error('No se pudo conectar con el servidor central.');
  }
};

/**
 * Limpia el almacenamiento local para cerrar la sesión del nodo
 */
export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};