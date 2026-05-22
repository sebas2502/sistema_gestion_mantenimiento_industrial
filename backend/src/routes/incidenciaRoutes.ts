import { Router } from 'express';
import { registrarIncidencia, consultarIncidencias, validarIncidencia } from '../controllers/IncidenciaController';
import { autenticarToken , verificarRol } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', autenticarToken, verificarRol('OPERARIO','SUPERVISOR','ADMINISTRADOR','INGENIERO'), registrarIncidencia);
router.get('/', autenticarToken, consultarIncidencias);
router.patch('/:id/validar',autenticarToken,verificarRol('SUPERVISOR','ADMINISTRADOR','INGENIERO'), validarIncidencia); // PATCH porque el Supervisor altera solo un recurso parcial

export default router;