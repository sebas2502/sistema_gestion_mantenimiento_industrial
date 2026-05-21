import { AppDataSource } from '../config/data-source';
import { OrdenTrabajo } from '../models/OrdenTrabajo';
import { Activo } from '../models/Activo';
import { Incidencia } from '../models/Incidencia';
import { EstadoOT } from '../enums/EstadoOT';
import { EstadoActivo } from '../enums/EstadoActivo';

export class OrdenTrabajoService {
  private otRepository = AppDataSource.getRepository(OrdenTrabajo);
  private activoRepository = AppDataSource.getRepository(Activo);
  private incidenciaRepository = AppDataSource.getRepository(Incidencia);

  // Generar una nueva Orden de Trabajo (Preventiva, Correctiva o Predictiva Automática)
  // ADAPTADO: tecnicoId ahora lleva "?" para permitir que sea opcional
  async crearOrden(datos: Partial<OrdenTrabajo>, activoId: number, tecnicoId?: number, incidenciaId?: number): Promise<OrdenTrabajo> {
    const activo = await this.activoRepository.findOneBy({ id: activoId });
    if (!activo) throw new Error('El activo industrial especificado no existe.');

    // Autogeneramos un código correlativo simple para control de planta
    const conteo = await this.otRepository.count();
    const codigoOT = `OT-${new Date().getFullYear()}-${String(conteo + 1).padStart(3, '0')}`;

    const nuevaOT = this.otRepository.create({
      tarea: datos.tarea,
      detalles: datos.detalles,
      fechaProgramada: datos.fechaProgramada,
      codigo: codigoOT,
      activo: activo,
      // ADAPTADO: Si viene id se mapea, si no viene (Módulo Predictivo) se guarda en null de forma segura
      tecnicoAsignado: tecnicoId ? ({ id: tecnicoId } as any) : null, 
      estado: EstadoOT.PENDIENTE
    });

    // Si la OT nace a partir de una falla reportada (Mantenimiento Correctivo)
    if (incidenciaId) {
      const incidencia = await this.incidenciaRepository.findOneBy({ id: incidenciaId });
      if (incidencia) {
        nuevaOT.incidencia = incidencia;
        // Pasamos la incidencia a "En Proceso" para que el operador sepa que se está atendiendo
        incidencia.estado = 'En Proceso';
        await this.incidenciaRepository.save(incidencia);
      }
    }

    return await this.otRepository.save(nuevaOT);
  }

  // Consultar el listado general de OTs de la hilandería
  async consultarOrdenes(): Promise<OrdenTrabajo[]> {
    return await this.otRepository.find({
      relations: ['activo', 'tecnicoAsignado', 'incidencia'],
      order: { fechaCreacion: 'DESC' }
    });
  }

  // Cambiar el estado de la OT (Control de flujo de trabajo)
  async actualizarEstadoOT(id: number, nuevoEstado: EstadoOT): Promise<OrdenTrabajo | null> {
    const ot = await this.otRepository.findOne({ where: { id }, relations: ['activo', 'incidencia'] });
    if (!ot) return null;

    ot.estado = nuevoEstado;

    // REGLA DE TRANSMISIÓN DE ESTADOS DE PLANTA:
    if (ot.activo) {
      if (nuevoEstado === EstadoOT.EN_PROCESO) {
        // El mecánico tildó que empezó a desarmar: la máquina pasa a Mantenimiento
        ot.activo.estado = EstadoActivo.MANTENIMIENTO;
        await this.activoRepository.save(ot.activo);
      } else if (nuevoEstado === EstadoOT.COMPLETADA) {
        // CORREGIDO: Volvemos al enum correcto (EstadoActivo.DISPONIBLE) para habilitar el activo
        ot.activo.estado = EstadoActivo.Activo;
        await this.activoRepository.save(ot.activo);

        // Si venía de una incidencia, la marcamos como Resuelta por completo
        if (ot.incidencia) {
          ot.incidencia.estado = 'Resuelta';
          await this.incidenciaRepository.save(ot.incidencia);
        }
      }
    }

    return await this.otRepository.save(ot);
  }
}