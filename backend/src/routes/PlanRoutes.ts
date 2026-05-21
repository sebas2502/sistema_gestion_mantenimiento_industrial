import { Router } from 'express';
import { PlanPreventivoController } from '../controllers/PlanPreventivoController';
import { PlanPreventivoService } from '../services/PlanPreventivoService';

const router = Router();
const controller = new PlanPreventivoController();

const preventivoService = new PlanPreventivoService();

// Endpoint para el listado general de planes del taller
router.get('/', controller.listarPlanes.bind(controller));

// Endpoint para dar de alta un nuevo cronograma con su checklist (Acceso Supervisor)
router.post('/', controller.crearPlan.bind(controller));

// Endpoint de simulación manual
router.post('/simulacionPreventiva', async (req, res) => {
    console.log("--> API de simulación llamada");
  try {
    await preventivoService.procesarPlanesPreventivos();
    return res.status(200).json({ message: "Cron Job simulado: Procesamiento de planes preventivos completado." });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;