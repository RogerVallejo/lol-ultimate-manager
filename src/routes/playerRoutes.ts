import { Router } from "express";
import { seedPlayers, getPlayers } from "../controllers/playerController";

const router = Router();

router.post("/seed", seedPlayers); // poblar jugadores
router.get("/", getPlayers);       // listar jugadores

export default router;
