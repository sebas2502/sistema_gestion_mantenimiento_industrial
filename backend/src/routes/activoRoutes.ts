import { Router } from 'express';
import { registrarActivo, consultarActivos, actualizarActivo, darDeBajaActivo } from '../controllers/ActivoController';
import { autenticarToken , verificarRol } from '../middlewares/authMiddleware';


const router = Router();

router.post('/', autenticarToken , verificarRol('ADMINISTRADOR'), registrarActivo);
router.get('/', autenticarToken , consultarActivos);
router.put('/:id',autenticarToken , verificarRol('ADMINISTRADOR'), actualizarActivo);
router.delete('/:id', autenticarToken , verificarRol('ADMINISTRADOR'), darDeBajaActivo);

export default router;