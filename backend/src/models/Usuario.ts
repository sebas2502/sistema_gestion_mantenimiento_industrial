import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Rol } from "../enums/Rol";

@Entity({ name: "usuario" })
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    nombre!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    clave!: string; // En producción iría encriptada

    @Column({
        type: "enum",
        enum: Rol,
        default: Rol.OPERARIO
    })
    rol!: Rol;

    @Column({ type: "boolean", default: true })
    estaActivo!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}