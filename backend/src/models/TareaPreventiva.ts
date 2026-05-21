import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlanPreventivo } from './PlanPreventivo';

@Entity('tarea_preventiva')
export class TareaPreventiva {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string; // Ej: "Cambio de aceite de carter"

  @Column({ type: 'text', nullable: true })
  especificacion!: string; // Ej: "Usar lubricante SAE 40, verificar nivel óptimo"

  @ManyToOne(() => PlanPreventivo, (plan) => plan.tareas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_preventivo_id' })
  planPreventivo!: PlanPreventivo;
}