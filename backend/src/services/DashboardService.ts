import { AppDataSource } from '../config/data-source';
import { Activo } from '../models/Activo';
import { Incidencia } from '../models/Incidencia';
import { OrdenTrabajo } from '../models/OrdenTrabajo';
import { PlanPreventivo } from '../models/PlanPreventivo'; 
import { EstadoOT } from '../enums/EstadoOT';
import { OrdenTrabajoService } from './OrdenTrabajoService';
import { LessThan, Not, In } from 'typeorm'; 
import { EstadoActivo } from '../enums/EstadoActivo';

export class DashboardService {
  private activoRepository = AppDataSource.getRepository(Activo);
  private incidenciaRepository = AppDataSource.getRepository(Incidencia);
  private otRepository = AppDataSource.getRepository(OrdenTrabajo);
  private planRepository = AppDataSource.getRepository(PlanPreventivo); 
  private otService = new OrdenTrabajoService();

  async obtenerMetricasYAlertas() {
    
    // =================================================================
    // ⚙️ SUB-MÓDULO: PROCESAMIENTO DE PLANES PREVENTIVOS MULTITAREA (Checklist)
    // =================================================================
    const fechaActual = new Date();
    
    // 🔍 Traemos los planes incluyendo explícitamente sus tareas asociadas (Checklist)
    const todosLosPlanes = await this.planRepository.find({ 
      relations: ['activo', 'tareas'] 
    });

    for (const plan of todosLosPlanes) {
      // Si el calendario del plan preventivo se encuentra vencido...
      if (fechaActual >= plan.fechaProximaFrecuencia) {
        
        // Control de Idempotencia basado en el nombre único del Plan Preventivo
        const otPreventivaExistente = await this.otRepository.findOne({
          where: {
            activo: { id: plan.activo.id },
            estado: In([EstadoOT.PENDIENTE, EstadoOT.EN_PROCESO]),
            tarea: `Mantenimiento Preventivo: ${plan.nombrePlan}`
          }
        });

        if (!otPreventivaExistente) {
          
          // 🔍 Compilamos dinámicamente las subtareas para armar la hoja de ruta en formato string
          const hojaDeRutaChecklist = plan.tareas && plan.tareas.length > 0
            ? plan.tareas.map((t, index) => `${index + 1}. [ ] ${t.nombre} ➔ Especificación: ${t.especificacion || 'General.'}`).join('\n')
            : 'No se detallaron subtareas específicas para este plan de mantenimiento.';

          // Emitimos una ÚNICA Orden de Trabajo conteniendo todo el protocolo de parada
          await this.otService.crearOrden(
            {
              tarea: `Mantenimiento Preventivo: ${plan.nombrePlan}`,
              detalles: `ALERTA CALENDARIO PREVENTIVO: Ciclo programado cada ${plan.frecuenciaDias} días.\n\nPROTOCOLOS Y PASOS DE CONTROL REQUERIDOS:\n${hojaDeRutaChecklist}`,
            },
            plan.activo.id,
            undefined // Queda a la espera de que el Supervisor designe un operario en el Frontend
          );

          // Avanzamos el calendario del plan para el próximo vencimiento sistemático
          plan.fechaUltimaFrecuencia = new Date();
          
          const nuevaProximaFecha = new Date();
          nuevaProximaFecha.setDate(nuevaProximaFecha.getDate() + plan.frecuenciaDias);
          plan.fechaProximaFrecuencia = nuevaProximaFecha;

          await this.planRepository.save(plan);
        }
      }
    }

    // =================================================================
    // 1. CONTEOS BÁSICOS PARA LAS TARJETAS (KPIs)
    // =================================================================
    const totalActivos = await this.activoRepository.count();
    const otsPendientes = await this.otRepository.count({ where: { estado: EstadoOT.PENDIENTE } });
    const otsEnProceso = await this.otRepository.count({ where: { estado: EstadoOT.EN_PROCESO } });
    const incidenciasAbiertas = await this.incidenciaRepository.count({ where: { estado: 'Abierta' } });

    // =================================================================
    // 2. CÁLCULO DE DISPONIBILIDAD GLOBAL DE PLANTA
    // =================================================================
    const activosOperativos = await this.activoRepository.createQueryBuilder('activo')
      .where('activo.estado != :estado', { estado: 'Fuera de Servicio' })
      .andWhere('activo.estado != :inactivo', { inactivo: 'Inactivo' })
      .getCount();
    
    const disponibilidadGlobal = totalActivos > 0 ? Math.round((activosOperativos / totalActivos) * 100) : 100;

    // =================================================================
    // 3. ALGORITMO INTELIGENTE: ANÁLISIS DE MTBF Y PATRONES DE DETERIORO
    // =================================================================
    const todosLosActivos = await this.activoRepository.find({
      where: {
        estado: Not(EstadoActivo.INACTIVO)
      }
    });

    const alertasPredictivas: any[] = [];
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);

    for (const activo of todosLosActivos) {
      const historialIncidencias = await this.incidenciaRepository.find({
        where: { activo: { id: activo.id } },
        order: { fechaRegistro: 'ASC' }
      });

      if (historialIncidencias.length >= 2) {
        let sumaIntervalosDias = 0;

        for (let i = 1; i < historialIncidencias.length; i++) {
          const difMs = historialIncidencias[i].fechaRegistro.getTime() - historialIncidencias[i - 1].fechaRegistro.getTime();
          sumaIntervalosDias += difMs / (1000 * 60 * 60 * 24); 
        }

        const mtbfHistorico = sumaIntervalosDias / (historialIncidencias.length - 1);
        const incidenciasMes = historialIncidencias.filter(inc => inc.fechaRegistro >= unMesAtras).length;

        const longitud = historialIncidencias.length;
        const ultimoIntervaloDias = (historialIncidencias[longitud - 1].fechaRegistro.getTime() - historialIncidencias[longitud - 2].fechaRegistro.getTime()) / (1000 * 60 * 60 * 24);

        const umbralCriticoDias = 15;
        const mtbfBajo = mtbfHistorico < umbralCriticoDias;
        const tendenciaAcelerada = ultimoIntervaloDias < mtbfHistorico;

        if (mtbfBajo && tendenciaAcelerada) {
          alertasPredictivas.push({
            activoId: activo.id,
            activoNombre: activo.nombre,
            ubicacion: activo.ubicacion,
            mtbf: Math.round(mtbfHistorico * 10) / 10,
            frecuenciaMes: incidenciasMes,
            diagnostico: 'Deterioro Acelerado: El intervalo entre fallas se está reduciendo críticamente.'
          });

          const otPredictivaExistente = await this.otRepository.findOne({
            where: {
              activo: { id: activo.id },
              estado: In([EstadoOT.PENDIENTE, EstadoOT.EN_PROCESO]), 
              tarea: `Inspección Predictiva Automatizada - MTBF Crítico`
            }
          });

          if (!otPredictivaExistente) {
            await this.otService.crearOrden(
              {
                tarea: `Inspección Predictiva Automatizada - MTBF Crítico`,
                detalles: `ALERTA GENERADA POR EL SISTEMA: El MTBF cayó a ${Math.round(mtbfHistorico)} días con tendencia de degradación acelerada. Requiere revisión de órganos de transmisión o fatiga mecánica.`,
              },
              activo.id,
              undefined 
            );
          }
        }
      }
    }

    return {
      kpis: {
        totalActivos,
        otsPendientes,
        otsEnProceso,
        incidenciasAbiertas,
        disponibilidadGlobal
      },
      alertasPredictivas
    };
  }
}