import api from './api';

// 🔍 GET: Recupera todos los planes preventivos con sus checklists relacionales
export const obtenerPlanesPreventivos = async () => {
  const res = await api.get("/planes");
  return res.data;
};

// 🔍 POST: Registra un nuevo plan junto con su lote de tareas en cascada
export const crearPlanPreventivo = async (planDTO) => {
  const res = await api.post("/planes", planDTO);
  return res.data;
};


//Simulamos el paso del tiempo para la ejecucion de un plan
export const dispararSimulacionPreventivo = async () => {
  const res = await api.post("planes/simulacionPreventiva");
  return res.data;
};