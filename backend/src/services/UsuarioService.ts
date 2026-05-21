import { AppDataSource } from "../config/data-source";
import { Usuario } from "../models/Usuario";
import { Rol } from "../enums/Rol";

export class UsuarioService {
    private usuarioRepository = AppDataSource.getRepository(Usuario);

    async crearUsuario(userData: Partial<Usuario>): Promise<Usuario> {
        const existingUser = await this.usuarioRepository.findOneBy({ email: userData.email });
        if (existingUser) {
            throw new Error("El correo electrónico ya está registrado.");
        }
        const nuevoUsuario = this.usuarioRepository.create(userData);
        return await this.usuarioRepository.save(nuevoUsuario);
    }

    async obtenerTodos(): Promise<Usuario[]> {
        // Retornamos solo los usuarios activos (Baja lógica)
        return await this.usuarioRepository.findBy({ estaActivo: true });
    }

    async obtenerPorId(id: number): Promise<Usuario | null> {
        const usuario = await this.usuarioRepository.findOneBy({ id, estaActivo: true });
        if (!usuario) throw new Error("Usuario no encontrado.");
        return usuario;
    }

    async updateUser(id: number, updateData: Partial<Usuario>): Promise<Usuario> {
        const usuario = await this.obtenerPorId(id);
        if (!usuario) throw new Error("Usuario no encontrado.");
        
        this.usuarioRepository.merge(usuario, updateData);
        return await this.usuarioRepository.save(usuario);
    }

    async deleteUser(id: number): Promise<void> {
        const usuario = await this.obtenerPorId(id);
        if (!usuario) throw new Error("Usuario no encontrado.");
        
        // Aplicamos baja lógica cambiando el estado a inactivo
        usuario.estaActivo = false;
        await this.usuarioRepository.save(usuario);
    }
}