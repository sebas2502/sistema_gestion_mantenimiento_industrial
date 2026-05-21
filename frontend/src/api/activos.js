import api from './api'; // Tu instancia base de axios

export const obtenerActivos = async () => {
  const res = await api.get("/activos");
  
  return res.data;
};

export const crearActivo = async (activoData) => {
  const res = await api.post("/activos", activoData);
  return res.data;
};

export const actualizarActivo = async (id, activoData) => {
  const res = await api.put(`/activos/${id}`, activoData);
  return res.data;
};

export const eliminarActivo = async (id) => {
  const res = await api.delete(`/activos/${id}`);
  return res.data;
};