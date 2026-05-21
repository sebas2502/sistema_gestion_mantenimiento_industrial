import { Request, Response } from 'express';
import { IncidenciaService } from '../services/IncidenciaService';

const incidenciaService = new IncidenciaService();

export const registrarIncidencia = async (req: Request, res: Response) => {
  try {
    const { activoId, descripcion, usuarioId } = req.body;
    if (!activoId || !descripcion || !usuarioId) {
      return res.status(400).json({ mensaje: 'Datos obligatorios incompletos.' });
    }
    const nueva = await incidenciaService.registrarIncidencia(activoId, descripcion, usuarioId);
    res.status(201).json(nueva);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
};

export const consultarIncidencias = async (_req: Request, res: Response) => {
  try {
    const lista = await incidenciaService.consultarIncidencias();
    res.status(200).json(lista);
  } catch (error: any) {
    res.status(500).json({ mensaje: 'Error al obtener incidencias.' });
  }
};

export const validarIncidencia = async (req: Request, res: Response) => {
  try {
    const { prioridad } = req.body;
    const actualizada = await incidenciaService.validarYClasificarIncidencia(Number(req.params.id), prioridad);
    if (!actualizada) return res.status(404).json({ mensaje: 'Incidencia no encontrada.' });
    res.status(200).json(actualizada);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
};