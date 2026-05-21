import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Activo } from './Activo';
import { Usuario } from './Usuario'; // Asegurá el nombre exacto de tu entidad Usuario
import { PrioridadIncidencia } from '../enums/PrioridadIncidencia';

@Entity('incidencia')
export class Incidencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({
    type: 'enum',
    enum: PrioridadIncidencia,
    default: PrioridadIncidencia.PENDIENTE
  })
  prioridad!: PrioridadIncidencia;

  @Column({ type: 'varchar', length: 50, default: 'Abierta' })
  estado!: string; // Abierta, En Proceso, Resuelta

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro!: Date;

  // Relación: Muchas incidencias pertenecen a un Activo (RF05)
  @ManyToOne(() => Activo, (activo) => activo.incidencias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo!: Activo;

  // Relación: Quién reportó la falla (Operario)
  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_reporta_id' })
  usuarioReporta!: Usuario;
}