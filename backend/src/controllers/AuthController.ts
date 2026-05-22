import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, clave } = req.body;
    console.log("datos backend: ",email+" "+clave);

    // 🔍 Validación primaria de campos
    if (!email || !clave) {
      return res.status(400).json({ mensaje: 'Debe ingresar un usuario y contraseña.' });
    }

    // ⚙️ Ejecutamos la lógica de negocio en el servicio (TypeORM + Bcrypt + JWT)
    const datosSesion = await authService.login(email, clave);

    // 🚀 Si las credenciales son válidas, respondemos con el token y datos del usuario
    return res.status(200).json(datosSesion);
    
  } catch (error: any) {
    // 🛡️ Seguridad: Si el servicio tira error ("Credenciales inválidas"),
    // respondemos con un 401 (Unauthorized) y el mensaje correspondiente.
    return res.status(401).json({ mensaje: error.message || 'Error en el proceso de autenticación.' });
  }
};