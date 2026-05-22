import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";
import { autenticarToken , verificarRol } from '../middlewares/authMiddleware';

const router = Router();
const usuarioController = new UsuarioController();

router.post("/", autenticarToken , verificarRol('ADMINISTRADOR'), usuarioController.crear);
router.get("/", autenticarToken , usuarioController.obtenerTodos);
router.get("/:id", autenticarToken , usuarioController.obtenerPorId);
router.put("/:id", autenticarToken , verificarRol('ADMINISTRADOR'), usuarioController.actualizar);
router.delete("/:id", autenticarToken , verificarRol('ADMINISTRADOR'), usuarioController.eliminar);

export default router;