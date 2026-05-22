import { AppDataSource } from '../config/data-source'; // Tu archivo de configuración de conexión de TypeORM
import { Usuario } from '../models/Usuario';     // Tu entidad de Usuario
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SECRETA_SUPER_SEGURA_EMILIO_ALAL';

export class AuthService {
  // Obtenemos el repositorio nativo de TypeORM para la entidad Usuario
  private usuarioRepository = AppDataSource.getRepository(Usuario);

  async login(email: string, clavePlana: string) {
    
    // 🔍 1. Buscar al usuario en la base de datos por su username
    const usuario = await this.usuarioRepository.findOne({
      where: { email }
    });

    // Si no existe el usuario, rebotamos con un mensaje genérico por seguridad
    if (!usuario) {
      throw new Error('Credenciales inválidas de acceso.');
    }

    // 🔑 2. Verificar si la contraseña ingresada coincide con el hash de la DB
    // (Asegurate de que en tu entidad el campo se llame 'password' o 'contrasenia')
    const passwordCoincide = await bcrypt.compare(clavePlana, usuario.clave);
    
    if (!passwordCoincide) {
      throw new Error('Credenciales inválidas de acceso.');
    }

    // 🛡️ 3. Armar el payload con los datos reales que recuperamos de la base de datos
    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre, // Por ejemplo: "Carlos Gómez"
      rol: usuario.rol       // 'OPERARIO', 'SUPERVISOR', o 'ADMINISTRADOR'
    };

    // ✍️ 4. Firmar el JWT (Válido por 8 horas, ideal para cubrir el turno de la hilandería)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Devolvemos el token criptográfico y los datos limpios para el estado global del Front
    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    };
  }
}