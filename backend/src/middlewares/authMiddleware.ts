import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz de Express para poder guardar los datos del usuario autenticado en la request
export interface RequestAutenticada extends Request {
  usuarioLogueado?: {
    id: number;
    username: string;
    rol: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SECRETA_SUPER_SEGURA_EMILIO_ALAL';

// 🛡️ Middleware 1: Verificar que esté logueado
export const autenticarToken = (req: RequestAutenticada, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // Formato esperado: "Bearer TOKEN_JWT"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '[AUTH ERROR]: Acceso denegado. Token no suministrado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, datosDecodificados) => {
    if (err) {
      return res.status(403).json({ error: '[AUTH ERROR]: Token inválido o expirado.' });
    }
    
    // Inyectamos los datos del usuario en la petición para que los controladores la usen
    req.usuarioLogueado = datosDecodificados as RequestAutenticada['usuarioLogueado'];
    next();
  });
};

// 🔐 Middleware 2: Control de Roles Dinámico
export const verificarRol = (...rolesPermitidos: string[]) => {
  return (req: RequestAutenticada, res: Response, next: NextFunction) => {
    if (!req.usuarioLogueado) {
      return res.status(401).json({ error: '[AUTH ERROR]: Usuario no autenticado.' });
    }

    const { rol } = req.usuarioLogueado;

    // Si el rol del usuario no está en la lista de roles autorizados para esta ruta... rebotado.
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ 
        error: `[ACCESS DENIED]: Nivel de privilegios insuficiente. Se requiere: [${rolesPermitidos.join(', ')}]` 
      });
    }

    next();
  };
};