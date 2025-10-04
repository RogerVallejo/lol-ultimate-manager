import { Router } from "express";
import { getMyCards } from "../controllers/cardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/mine", authMiddleware, getMyCards);

export default router;
