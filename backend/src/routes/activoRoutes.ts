import { Router } from 'express';
import { registrarActivo, consultarActivos, actualizarActivo, darDeBajaActivo } from '../controllers/ActivoController';

const router = Router();

router.post('/', registrarActivo);
router.get('/', consultarActivos);
router.put('/:id', actualizarActivo);
router.delete('/:id', darDeBajaActivo);

export default router;