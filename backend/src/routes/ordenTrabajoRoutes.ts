import { Router } from 'express';
import { crearOrdenTrabajo, consultarOrdenesTrabajo, actualizarEstadoOT } from '../controllers/OrdenTrabajoController';
import { autenticarToken , verificarRol } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', autenticarToken, verificarRol('SUPERVISOR','INGENIERO' , 'ADMINISTRADOR') , crearOrdenTrabajo);
router.get('/', autenticarToken, verificarRol('SUPERVISOR','INGENIERO' , 'ADMINISTRADOR','TECNICO_MANTENIMIENTO') ,consultarOrdenesTrabajo);
router.patch('/:id/estado', autenticarToken, verificarRol('TECNICO_MANTENIMIENTO') , actualizarEstadoOT); // PATCH para mutación de estado parcial

export default router;