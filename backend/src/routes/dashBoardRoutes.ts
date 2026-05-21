import { Router } from 'express';
import { obtenerAnalisisDashboard } from '../controllers/DashboardController';

const router = Router();

router.get('/', obtenerAnalisisDashboard);

export default router;