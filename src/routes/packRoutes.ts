import { Router } from "express";
import { getPackPrices, openPack } from "../controllers/packController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/open", authMiddleware, openPack);

router.get("/prices", getPackPrices)

export default router;
