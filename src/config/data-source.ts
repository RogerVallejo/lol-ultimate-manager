import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
import { Card } from "../entities/Card";
import { Player } from "../entities/Player";
import { Match } from "../entities/Match";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "lol_manager",
  synchronize: true,
  logging: false,
  entities: [User, Team, Card, Player, Match], // ✅ asegúrate que Match está aquí
});
