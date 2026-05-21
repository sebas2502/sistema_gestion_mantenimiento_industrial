import api from './api';

export const obtenerAnaliticaDashboard = async () => {
  const res = await api.get("/analisis");
  return res.data;
};