import { Request, Response } from "express";
import { UsuarioService } from "../services/UsuarioService";

const usuarioService = new UsuarioService();

export class UsuarioController {
    
    async crear(req: Request, res: Response): Promise<void> {
        try {
            const usuario = await usuarioService.crearUsuario(req.body);
            res.status(201).json(usuario);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodos(req: Request, res: Response): Promise<void> {
        try {
            const usuarios = await usuarioService.obtenerTodos();
            res.status(200).json(usuarios);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const usuario = await usuarioService.obtenerPorId(id);
            res.status(200).json(usuario);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const user = await usuarioService.updateUser(id, req.body);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            await usuarioService.deleteUser(id);
            res.status(200).json({ message: "Usuario eliminado correctamente (Baja lógica)." });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}