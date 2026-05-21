import api from './api';

export const obtenerIncidencias = async () => {
  const res = await api.get("/incidencias");
  return res.data;
};

export const registrarIncidencia = async (incidenciaData) => {
  // Espera: { activoId, descripcion, usuarioId }
  const res = await api.post("/incidencias", incidenciaData);
  return res.data;
};

export const validarIncidencia = async (id, prioridad) => {
  // El supervisor clasifica la prioridad (Baja, Media, Alta, Crítica)
  const res = await api.patch(`/incidencias/${id}/validar`, { prioridad });
  return res.data;
};