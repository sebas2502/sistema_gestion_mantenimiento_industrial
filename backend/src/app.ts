import express from "express";
import { AppDataSource } from "./config/data-source";
import dotenv from "dotenv";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes";
import activoRoutes from "./routes/activoRoutes";
import incideniasRoutes from "./routes/incidenciaRoutes";
import ordenTrabajoRoutes from "./routes/ordenTrabajoRoutes";
import dashboardRoutes from "./routes/dashBoardRoutes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 4000;


AppDataSource.initialize()
  .then(() => {
    console.log("📦 DB conectada");

    app.listen(PORT, () => {
      console.log(`🚀 Server en http://localhost:${PORT}`);
    });

    })
  .catch((error) => console.log(error));

app.use('/api/usuarios',usuarioRoutes);
app.use('/api/activos',activoRoutes);
app.use('/api/incidencias',incideniasRoutes);
app.use('/api/ordenes',ordenTrabajoRoutes);
app.use('/api/analisis', dashboardRoutes);