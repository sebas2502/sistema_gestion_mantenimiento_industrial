import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Activo } from './Activo';
import { Usuario } from './Usuario';
import { Incidencia } from './Incidencia';
import { EstadoOT } from '../enums/EstadoOT';

@Entity('orden')
export class OrdenTrabajo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  codigo!: string; // Ej: "OT-2026-001" para control interno

  @Column({ type: 'varchar', length: 200 })
  tarea!: string; // Ej: "Cambio de guarnición en cilindro principal"

  @Column({ type: 'text', nullable: true })
  detalles!: string;

  @Column({
    type: 'enum',
    enum: EstadoOT,
    default: EstadoOT.PENDIENTE
  })
  estado!: EstadoOT;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_programada' })
  fechaProgramada!: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  // Relación: A qué máquina se le realiza el mantenimiento
  @ManyToOne(() => Activo, { eager: true })
  @JoinColumn({ name: 'activo_id' })
  activo!: Activo;

  // Relación: Qué Técnico o Mecánico de planta tiene asignada la tarea
  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'tecnico_asignado_id' })
  tecnicoAsignado!: Usuario;

  // Relación Opcional: Si viene de un reporte de falla de un operario (Correctivo)
  @ManyToOne(() => Incidencia, { nullable: true, eager: true })
  @JoinColumn({ name: 'incidencia_id' })
  incidencia!: Incidencia;
}