import { Router } from 'express';
import { crearOrdenTrabajo, consultarOrdenesTrabajo, actualizarEstadoOT } from '../controllers/OrdenTrabajoController';

const router = Router();

router.post('/', crearOrdenTrabajo);
router.get('/', consultarOrdenesTrabajo);
router.patch('/:id/estado', actualizarEstadoOT); // PATCH para mutación de estado parcial

export default router;