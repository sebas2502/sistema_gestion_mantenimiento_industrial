import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// 🛡️ INTERCEPTOR DE PETICIONES: Inyecta el JWT en cada llamada de forma transparente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Metemos el token con el formato "Bearer TOKEN" que configuramos en el backend
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔄 OPCIONAL: Interceptor de respuestas para manejar deslogueos automáticos (Tokens expirados)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend nos rebota con 401 (No autorizado) o 403 (Token vencido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      //localStorage.removeItem('token');
      //localStorage.removeItem('usuario');
      // Forzamos la recarga para que App.jsx detecte que no hay sesión y mande al Login
      //window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;