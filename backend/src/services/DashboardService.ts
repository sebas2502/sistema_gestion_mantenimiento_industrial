import { AppDataSource } from '../config/data-source';
import { Activo } from '../models/Activo';
import { Incidencia } from '../models/Incidencia';
import { OrdenTrabajo } from '../models/OrdenTrabajo';
import { EstadoOT } from '../enums/EstadoOT';
import { OrdenTrabajoService } from './OrdenTrabajoService';
import { LessThan , Not, In } from 'typeorm'; // 🔍 AGREGAMOS "In" ACÁ
import { EstadoActivo } from '../enums/EstadoActivo';

export class DashboardService {
  private activoRepository = AppDataSource.getRepository(Activo);
  private incidenciaRepository = AppDataSource.getRepository(Incidencia);
  private otRepository = AppDataSource.getRepository(OrdenTrabajo);
  private otService = new OrdenTrabajoService();

  async obtenerMetricasYAlertas() {
    // 1. CONTEOS BÁSICOS PARA LAS TARJETAS (KPIs)
    const totalActivos = await this.activoRepository.count();
    const otsPendientes = await this.otRepository.count({ where: { estado: EstadoOT.PENDIENTE } });
    const otsEnProceso = await this.otRepository.count({ where: { estado: EstadoOT.EN_PROCESO } });
    const incidenciasAbiertas = await this.incidenciaRepository.count({ where: { estado: 'Abierta' } });

    // 2. CÁLCULO DE DISPONIBILIDAD GLOBAL DE PLANTA
    const activosOperativos = await this.activoRepository.createQueryBuilder('activo')
      .where('activo.estado != :estado', { estado: 'Fuera de Servicio' })
      .andWhere('activo.estado != :inactivo', { inactivo: 'Inactivo' })
      .getCount();
    
    const disponibilidadGlobal = totalActivos > 0 ? Math.round((activosOperativos / totalActivos) * 100) : 100;

    // 3. ALGORITMO INTELIGENTE: ANÁLISIS DE MTBF Y PATRONES DE DETERIORO
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

          // =================================================================
          // 🔥 DISPARADOR AUTÓNOMO CORREGIDO (COMPROBACIÓN DE IDEMPOTENCIA)
          // =================================================================
          const otExistente = await this.otRepository.findOne({
            where: {
              activo: { id: activo.id },
              // 🔍 Usamos In([ ... ]) para verificar si ya existe en cualquiera de los dos estados activos
              estado: In([EstadoOT.PENDIENTE, EstadoOT.EN_PROCESO]), 
              tarea: `Inspección Predictiva Automatizada - MTBF Crítico`
            }
          });

          if (!otExistente) {
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