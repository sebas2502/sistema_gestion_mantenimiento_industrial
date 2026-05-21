import { AppDataSource } from '../config/data-source';
import { PlanPreventivo } from '../models/PlanPreventivo';
import { OrdenTrabajo } from '../models/OrdenTrabajo';
import { OrdenTrabajoService } from './OrdenTrabajoService';
import { EstadoOT } from '../enums/EstadoOT';
import { In } from 'typeorm';

export class PlanPreventivoService {
  private planRepository = AppDataSource.getRepository(PlanPreventivo);
  private otRepository = AppDataSource.getRepository(OrdenTrabajo);
  private otService = new OrdenTrabajoService();

  async procesarPlanesPreventivos() {
    const fechaActual = new Date();

    // 1. Buscamos todos los planes cargando las relaciones estructuradas
    const planesVencidos = await this.planRepository.find({
      relations: ['activo', 'tareas'] 
    });

    for (const plan of planesVencidos) {
      
      // 🛡️ FILTRO TEMPORAL: Si el plan ya se actualizó en una vuelta previa, lo salteamos
      if (fechaActual < plan.fechaProximaFrecuencia) {
        continue;
      }

      // 2. CONTROL DE IDEMPOTENCIA STRICTO: ¿Ya existe una orden activa hoy?
      const otExistente = await this.otRepository.findOne({
        where: {
          activo: { id: plan.activo.id },
          estado: In([EstadoOT.PENDIENTE, EstadoOT.EN_PROCESO]),
          tarea: `Mantenimiento Preventivo: ${plan.nombrePlan}` 
        }
      });

      // 🔥 CORRECCIÓN CLAVE 1: Si ya existe la OT, metemos 'continue' para cortar el flujo de este elemento
      if (otExistente) {
        console.log(`[PREVENTIVO] OT ya existente para el plan ID ${plan.id}. Saltando...`);
        continue; 
      }
      
      // 3. 🔍 COMPILACIÓN DEL CHECKLIST DE TAREAS INDIVIDUALES
      const hojaDeRutaChecklist = plan.tareas && plan.tareas.length > 0
        ? plan.tareas.map((t, index) => `${index + 1}. [ ] ${t.nombre} ➔ Especificación: ${t.especificacion || 'General.'}`).join('\n')
        : 'No se detallaron subtareas específicas para este plan de mantenimiento.';

      // 🔥 CORRECCIÓN CLAVE 2: Avanzamos el calendario del plan e impactamos la DB PRIMERO.
      // De esta manera, si el bucle tiene al plan duplicado en memoria, la siguiente iteración
      // va a rebotar arriba de todo porque "fechaActual < plan.fechaProximaFrecuencia" pasará a ser TRUE.
      plan.fechaUltimaFrecuencia = new Date();
      
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + plan.frecuenciaDias);
      plan.fechaProximaFrecuencia = proximaFecha;

      // Guardamos la fecha del plan inmediatamente (Bloqueo preventivo)
      await this.planRepository.save(plan);

      // 4. Generamos de forma segura la única OT en el gestor operativo
      await this.otService.crearOrden(
        {
          tarea: `Mantenimiento Preventivo: ${plan.nombrePlan}`,
          detalles: `ALERTA CALENDARIO PREVENTIVO: Ciclo programado cada ${plan.frecuenciaDias} días.\n\nPROTOCOLOS Y PASOS DE CONTROL REQUERIDOS:\n${hojaDeRutaChecklist}`,
        },
        plan.activo.id,
        undefined 
      );

      console.log(`[PREVENTIVO AUTÓNOMO]: Emitida OT automática con Checklist para el activo: ${plan.activo.nombre}`);
    }
  }
}