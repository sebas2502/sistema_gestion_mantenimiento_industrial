import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

const dashboardService = new DashboardService();

export const obtenerAnalisisDashboard = async (_req: Request, res: Response) => {
  try {
    const analitica = await dashboardService.obtenerMetricasYAlertas();
    res.status(200).json(analitica);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({
      mensaje: 'Error al procesar la analítica predictiva de planta.',
      detalle: error.message
    });
  }
};