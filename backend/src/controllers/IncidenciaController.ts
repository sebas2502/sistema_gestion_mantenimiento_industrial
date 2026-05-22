import { Response } from 'express';
import { RequestAutenticada } from '../middlewares/authMiddleware'; // Asegurate de apuntar bien a tu middleware
import { IncidenciaService } from '../services/IncidenciaService';

const incidenciaService = new IncidenciaService();

// 🛠️ Registro de Incidencia (Usa el ID del token por seguridad)
export const registrarIncidencia = async (req: RequestAutenticada, res: Response) => {
  try {
    const { activoId, descripcion } = req.body;
    
    // 🔥 CONTROL DE SEGURIDAD: El ID del usuario se extrae del token validado, no del body
    const usuarioId = req.usuarioLogueado?.id;

    if (!activoId || !descripcion || !usuarioId) {
      return res.status(400).json({ mensaje: 'Datos obligatorios incompletos o sesión inválida.' });
    }

    const nueva = await incidenciaService.registrarIncidencia(activoId, descripcion, usuarioId);
    res.status(201).json(nueva);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
};

// 🔓 Consulta de Incidencias (Solo tipamos la request para mantener consistencia)
export const consultarIncidencias = async (_req: RequestAutenticada, res: Response) => {
  try {
    const lista = await incidenciaService.consultarIncidencias();
    res.status(200).json(lista);
  } catch (error: any) {
    res.status(500).json({ mensaje: 'Error al obtener incidencias.' });
  }
};

// 👑 Validación de Incidencias (Supervisor)
export const validarIncidencia = async (req: RequestAutenticada, res: Response) => {
  try {
    const { prioridad } = req.body;
    
    // Opcional: Podrías usar req.usuarioLogueado?.nombre por si querés guardar en la base de datos qué supervisor firmó la OT
    if (!prioridad) {
      return res.status(400).json({ mensaje: 'Debe especificar la prioridad para validar la incidencia.' });
    }

    const actualizada = await incidenciaService.validarYClasificarIncidencia(Number(req.params.id), prioridad);
    if (!actualizada) return res.status(404).json({ mensaje: 'Incidencia no encontrada.' });
    
    res.status(200).json(actualizada);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
};