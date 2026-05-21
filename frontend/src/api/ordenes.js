import api from './api'; // Tu instancia base de axios

export const obtenerOrdenes = async () => {
  const res = await api.get("/ordenes");
  return res.data;
};

export const crearOrdenTrabajo = async (ordenData) => {
  /* Espera: { tarea, detalles, fechaProgramada, activoId, tecnicoId, incidenciaId } */
  const res = await api.post("/ordenes", ordenData);
  return res.data;
};

export const actualizarEstadoOT = async (id, estado) => {
  const res = await api.patch(`/ordenes/${id}/estado`, { estado });
  return res.data;
};