import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";

const router = Router();
const usuarioController = new UsuarioController();

router.post("/", usuarioController.crear);
router.get("/", usuarioController.obtenerTodos);
router.get("/:id", usuarioController.obtenerPorId);
router.put("/:id", usuarioController.actualizar);
router.delete("/:id", usuarioController.eliminar);

export default router;