import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Activo } from './Activo';
import { TareaPreventiva } from './TareaPreventiva'; // 🔍 Importamos el nuevo modelo

@Entity('plan_preventivo')
export class PlanPreventivo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombrePlan!: string; // Ej: "Mantenimiento Mayor Trimestral"

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column()
  frecuenciaDias!: number;

  @Column({ type: 'timestamp' })
  fechaUltimaFrecuencia!: Date;

  @Column({ type: 'timestamp' })
  fechaProximaFrecuencia!: Date;

  @ManyToOne(() => Activo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activo_id' })
  activo!: Activo;

  // 🔍 Relación Uno a Muchos: Un plan tiene muchas tareas (Checklist)
  @OneToMany(() => TareaPreventiva, (tarea) => tarea.planPreventivo, { cascade: true })
  tareas!: TareaPreventiva[];

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro!: Date;
}