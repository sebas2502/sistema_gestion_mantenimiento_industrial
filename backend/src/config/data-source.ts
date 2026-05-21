import { DataSource } from "typeorm";
import { Usuario } from "../models/Usuario";
import { Activo } from "../models/Activo";
import { Incidencia } from "../models/Incidencia";
import { OrdenTrabajo } from "../models/OrdenTrabajo";

import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin",
    database: process.env.DB_NAME || "gestion_mantenimiento",
    synchronize: true, // Tip: usar true solo en desarrollo para que cree las tablas solas
    logging: false,
    entities: [Usuario, Activo, Incidencia, OrdenTrabajo],
    migrations: [],
    subscribers: [],
});