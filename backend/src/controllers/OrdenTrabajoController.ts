import { Request, Response } from 'express';
import { OrdenTrabajoService } from '../services/OrdenTrabajoService';
import { EstadoOT } from '../enums/EstadoOT';

const otService = new OrdenTrabajoService();

export const crearOrdenTrabajo = async (req: Request, res: Response) => {
  try {
    const { tarea, detalles, fechaProgramada, activoId, tecnicoId, incidenciaId } = req.body;
    
    if (!tarea || !activoId || !tecnicoId) {
      return res.status(400).json({ mensaje: 'Faltan parámetros críticos (tarea, activo o técnico).' });
    }

    const nueva = await otService.crearOrden(
      { tarea, detalles, fechaProgramada: fechaProgramada ? new Date(fechaProgramada) : undefined },
      Number(activoId),
      Number(tecnicoId),
      incidenciaId ? Number(incidenciaId) : undefined
    );

    res.status(201).json(nueva);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
};

export const consultarOrdenesTrabajo = async (_req: Request, res: Response) => {
  try {
    const lista = await otService.consultarOrdenes();
    res.status(200).json(lista);
  } catch (error: any) {
    res.status(500).json({ mensaje: 'Error al listar las órdenes de trabajo.' });
  }
};

export const actualizarEstadoOT = async (req: Request, res: Response) => {
  try {
    const { estado } = req.body;
    if (!Object.values(EstadoOT).includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado de orden de trabajo inválido.' });
    }

    const actualizada = await otService.actualizarEstadoOT(Number(req.params.id), estado);
    if (!actualizada) return res.status(404).json({ mensaje: 'Orden de trabajo no encontrada.' });

    res.status(200).json(actualizada);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
};