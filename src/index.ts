import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/data-source";
import userRoutes from "./routes/userRoutes";
import playerRoutes from "./routes/playerRoutes";
import teamRoutes from "./routes/teamRoutes";
import marketRoutes from "./routes/marketRoutes"
import matchRoutes from "./routes/matchRoutes"
import cardRoutes from "./routes/cardRoute"
import packRoutes from "./routes/packRoutes";
import cors from "cors";

// Rutas
const app = express();
const PORT = process.env.PORT || 4000;

// 🟢 Middleware CORS
app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    credentials: true,
  })
);

// 🟢 Middleware JSON
app.use(express.json());
app.use("/teams", teamRoutes);
app.use("/users", userRoutes);
app.use("/players", playerRoutes);
app.use("/market", marketRoutes);
app.use("/match", matchRoutes);
app.use("/cards", cardRoutes);
app.use("/packs", packRoutes)

console.log(process.env.DB_NAME)

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Conexión a PostgreSQL establecida");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la BD:", err);
  });
