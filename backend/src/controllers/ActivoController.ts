import { Request, Response } from 'express';
import { ActivoService } from '../services/ActivoService';

const activoService = new ActivoService();

export const registrarActivo = async (req: Request, res: Response) => {
  try {
    
    const nuevo = await activoService.registrarActivo(req.body);
    res.status(201).json(nuevo);
  } catch (error: any) {
    console.log(req.body)
    res.status(400).json({ mensaje: error.message });
  }
};

export const consultarActivos = async (_req: Request, res: Response) => {
  try {
    const lista = await activoService.consultarActivos();
    res.status(200).json(lista);
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ mensaje: 'Error al obtener activos.' });
  }
};

export const actualizarActivo = async (req: Request, res: Response) => {
  try {
    const actualizado = await activoService.actualizarActivo(Number(req.params.id), req.body);
    if (!actualizado) return res.status(404).json({ mensaje: 'Activo no encontrado.' });
    res.status(200).json(actualizado);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
};

export const darDeBajaActivo = async (req: Request, res: Response) => {
  try {
    const exito = await activoService.darDeBajaActivo(Number(req.params.id));
    if (!exito) return res.status(404).json({ mensaje: 'Activo no encontrado.' });
    res.status(200).json({ mensaje: 'Activo dado de baja correctamente.' });
  } catch (error: any) {
    res.status(500).json({ mensaje: 'Error al procesar la baja.' });
  }
};