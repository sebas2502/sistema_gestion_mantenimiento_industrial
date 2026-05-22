import { Router } from 'express';
import { PlanPreventivoController } from '../controllers/PlanPreventivoController';
import { PlanPreventivoService } from '../services/PlanPreventivoService';
import { autenticarToken , verificarRol } from '../middlewares/authMiddleware';


const router = Router();
const controller = new PlanPreventivoController();

const preventivoService = new PlanPreventivoService();

// Endpoint para el listado general de planes del taller
router.get('/', autenticarToken, verificarRol('SUPERVISOR','INGENIERO','ADMINISTRADOR'), controller.listarPlanes.bind(controller));

// Endpoint para dar de alta un nuevo cronograma con su checklist (Acceso Supervisor)
router.post('/', autenticarToken, verificarRol('INGENIERO','ADMINISTRADOR'),controller.crearPlan.bind(controller));

// Endpoint de simulación manual para ejecucion de planes preventivos
router.post('/simulacionPreventiva', async (req, res) => {
    
  try {
    await preventivoService.procesarPlanesPreventivos();
    return res.status(200).json({ message: "Cron Job simulado: Procesamiento de planes preventivos completado." });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;