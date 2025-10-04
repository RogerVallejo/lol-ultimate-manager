import { Router } from "express";
import { 
  addCardToTeam, 
  createTeam, 
  getTeamRoster, 
  getUserTeams, 
  removeCardFromTeam 
} from "../controllers/teamController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Crear equipo
router.post("/", authMiddleware, createTeam);

// Obtener equipos del usuario
router.get("/", authMiddleware, getUserTeams);

// Añadir carta a un equipo
router.post("/:teamId/cards", authMiddleware, addCardToTeam);

// Quitar carta de un equipo
router.delete("/:teamId/cards/:cardId", authMiddleware, removeCardFromTeam);

// Obtener plantilla completa de un equipo
router.get("/:teamId/roster", authMiddleware, getTeamRoster);

export default router;
