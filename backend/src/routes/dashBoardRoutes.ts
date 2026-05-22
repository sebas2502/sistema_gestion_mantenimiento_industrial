import { Router } from 'express';
import { obtenerAnalisisDashboard } from '../controllers/DashboardController';
import { autenticarToken , verificarRol } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', autenticarToken , verificarRol('INGENIERO','ADMINISTRADOR') , obtenerAnalisisDashboard);

export default router;