import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { EstadoActivo } from '../enums/EstadoActivo';
import { Incidencia } from './Incidencia';

@Entity('activo')
export class Activo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string; // Ej: "Carda Rieter C70", "Mechera Marzoli"

  @Column({ type: 'varchar', length: 100 })
  tipo!: string; // Categoria del activo

  @Column({ type: 'varchar', length: 100 })
  ubicacion!: string; // Sector de la planta (ej: "Hilandería Planta 1")

  @Column({
    type: 'enum',
    enum: EstadoActivo,
    default: EstadoActivo.Activo
  })
  estado!: EstadoActivo;

  @CreateDateColumn({ name: 'fecha_alta' })
  fechaAlta!: Date;

  @OneToMany(() => Incidencia, (incidencia) => incidencia.activo)
  incidencias!: Incidencia[];
}