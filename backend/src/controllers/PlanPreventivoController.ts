import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { PlanPreventivo } from '../models/PlanPreventivo';
import { TareaPreventiva } from '../models/TareaPreventiva';
import { Activo } from '../models/Activo';

export class PlanPreventivoController {
  private planRepository = AppDataSource.getRepository(PlanPreventivo);
  private activoRepository = AppDataSource.getRepository(Activo);

  // 1. GET: Listar todos los planes con sus relaciones para el front
  async listarPlanes(req: Request, res: Response) {
    try {
      const planes = await this.planRepository.find({
        relations: ['activo', 'tareas'],                    
        order: { fechaRegistro: 'DESC' }
      });
      
      return res.status(200).json(planes);
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error al recuperar los planes preventivos.', 
        error: error.message 
      });
    }
  }

  // 2. POST: Crear un nuevo Plan Preventivo con su Checklist dinámico (Cascada)
  async crearPlan(req: Request, res: Response) {
    try {
      const { nombrePlan, descripcion, frecuenciaDias, activoId, tareas } = req.body;

      // Validamos que exista el activo en la planta
      const activo = await this.activoRepository.findOneBy({ id: Number(activoId) });
      if (!activo) {
        return res.status(404).json({ message: 'El activo industrial especificado no existe.' });
      }

      // Creamos la instancia del Plan Preventivo
      const nuevoPlan = new PlanPreventivo();
      nuevoPlan.nombrePlan = nombrePlan;
      nuevoPlan.descripcion = descripcion;
      nuevoPlan.frecuenciaDias = Number(frecuenciaDias);
      nuevoPlan.activo = activo;

      // Calculamos los parámetros cronológicos iniciales
      const fechaActual = new Date();
      nuevoPlan.fechaUltimaFrecuencia = fechaActual;
      
      // La primera ejecución se programa sumando los días de frecuencia a la fecha actual
      const proximaFecha = new Date();
      proximaFecha.setDate(fechaActual.getDate() + Number(frecuenciaDias));
      nuevoPlan.fechaProximaFrecuencia = proximaFecha;

      // Mapeamos el array de subtareas que viene del front a instancias de TareaPreventiva
      if (tareas && tareas.length > 0) {
        nuevoPlan.tareas = tareas.map((t: any) => {
          const nuevaTarea = new TareaPreventiva();
          nuevaTarea.nombre = t.nombre;
          nuevaTarea.especificacion = t.especificacion;
          return nuevaTarea;
        });
      } else {
        nuevoPlan.tareas = [];
      }

      // Guardamos en la base de datos (TypeORM maneja la inserción en cascada de las tareas)
      const planGuardado = await this.planRepository.save(nuevoPlan);

      return res.status(201).json({
        message: 'Plan preventivo y checklist asociado creados con éxito.',
        data: planGuardado
      });

    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error de servidor al registrar el plan preventivo.', 
        error: error.message 
      });
    }
  }
}