import api from './api';

export const obtenerUsuarios = async () => {
  const res = await api.get("/usuarios");
  
  return res.data;
};

export const obtenerUsuario = async (id) => {
  const res = await api.get(`/usuarios/${id}`);
  return res.data;
};

export const crearUsuario = async (data) => {
    console.log(data)
  const res = await api.post(`/usuarios`,data);
  return res.data;
};

export const actualizarUsuario = async (id, usuarioData) => {
  const res = await api.put(`/usuarios/${id}`, usuarioData);
  return res.data;
};

export const eliminarUsuario = async (id) => {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
};

