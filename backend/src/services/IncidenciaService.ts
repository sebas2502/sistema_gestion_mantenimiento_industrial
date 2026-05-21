import { AppDataSource } from '../config/data-source';
import { Incidencia } from '../models/Incidencia';
import { Activo } from '../models/Activo';
import { PrioridadIncidencia } from '../enums/PrioridadIncidencia';
import { EstadoActivo } from '../enums/EstadoActivo'; // <--- IMPORTANTE IMPORTAR EL ENUM

export class IncidenciaService {
  private incidenciaRepository = AppDataSource.getRepository(Incidencia);
  private activoRepository = AppDataSource.getRepository(Activo);

  // RF05: Registrar Incidencia (Flujo del Operario de Turno)
  async registrarIncidencia(activoId: number, descripcion: string, usuarioId: number): Promise<Incidencia> {
    const activo = await this.activoRepository.findOneBy({ id: activoId });
    if (!activo) throw new Error('El activo industrial especificado no existe.');

    const incidencia = this.incidenciaRepository.create({
      descripcion,
      activo,
      usuarioReporta: { id: usuarioId } as any,
      prioridad: PrioridadIncidencia.PENDIENTE,
      estado: 'Abierta'
    });

    return await this.incidenciaRepository.save(incidencia);
  }

  // Consultar todas las incidencias de la hilandería
  async consultarIncidencias(): Promise<Incidencia[]> {
    return await this.incidenciaRepository.find({
      relations: ['activo', 'usuarioReporta'], // Traemos las relaciones para verlas en la tabla
      order: { fechaRegistro: 'DESC' } // Las más recientes arriba
    });
  }

  // RF06: Validar y Clasificar Incidencia (Flujo de toma de decisiones del Supervisor)
  async validarYClasificarIncidencia(id: number, prioridad: PrioridadIncidencia): Promise<Incidencia | null> {
    const incidencia = await this.incidenciaRepository.findOne({ 
      where: { id }, 
      relations: ['activo'] 
    });
    
    if (!incidencia) return null;

    // Asignamos la prioridad dictada por el Supervisor
    incidencia.prioridad = prioridad;

    // REGLA DE NEGOCIO INDUSTRIAL:
    // Si el supervisor determina que la falla es Alta o Crítica, la máquina se detiene automáticamente
    if (incidencia.activo) {
      if (prioridad === PrioridadIncidencia.CRITICA || prioridad === PrioridadIncidencia.ALTA) {
        incidencia.activo.estado = EstadoActivo.FUERA_DE_SERVICIO;
        await this.activoRepository.save(incidencia.activo);
      } else if (prioridad === PrioridadIncidencia.MEDIA) {
        incidencia.activo.estado = EstadoActivo.MANTENIMIENTO;
        await this.activoRepository.save(incidencia.activo);
      }
    }

    return await this.incidenciaRepository.save(incidencia);
  }
}