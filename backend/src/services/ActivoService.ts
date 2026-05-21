import { AppDataSource } from '../config/data-source';
import { Activo } from '../models/Activo';
import { EstadoActivo } from '../enums/EstadoActivo';

export class ActivoService {
  private activoRepository = AppDataSource.getRepository(Activo);

  async registrarActivo(datos: Partial<Activo>): Promise<Activo> {
    const nuevoActivo = this.activoRepository.create(datos);
    return await this.activoRepository.save(nuevoActivo);
  }

  async consultarActivos(): Promise<Activo[]> {
    // Retornamos solo los activos que no sufrieron baja lógica

    const todosLosActivos = await this.activoRepository.find({
    order: { id: 'ASC' }
  });

  return todosLosActivos.filter(activo => activo.estado !== EstadoActivo.INACTIVO);
  }

  async obtenerActivoPorId(id: number): Promise<Activo | null> {
    return await this.activoRepository.findOneBy({ id });
  }

  async actualizarActivo(id: number, datos: Partial<Activo>): Promise<Activo | null> {
    const activo = await this.obtenerActivoPorId(id);
    if (!activo) return null;
    this.activoRepository.merge(activo, datos);
    return await this.activoRepository.save(activo);
  }

  async darDeBajaActivo(id: number): Promise<boolean> {
    const activo = await this.obtenerActivoPorId(id);
    if (!activo) return false;
    activo.estado = EstadoActivo.INACTIVO; // Baja lógica según requerimientos
    await this.activoRepository.save(activo);
    return true;
  }
}