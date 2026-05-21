import { Router } from 'express';
import { registrarIncidencia, consultarIncidencias, validarIncidencia } from '../controllers/IncidenciaController';

const router = Router();

router.post('/', registrarIncidencia);
router.get('/', consultarIncidencias);
router.patch('/:id/validar', validarIncidencia); // PATCH porque el Supervisor altera solo un recurso parcial

export default router;