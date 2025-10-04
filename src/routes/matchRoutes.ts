import { Router } from "express";
import { playMatch, getUserMatches } from "../controllers/matchController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/play", authMiddleware, playMatch);
router.get("/", authMiddleware, getUserMatches);

export default router;
