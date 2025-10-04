import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { listCard, getMarket, buyCard, cancelListing } from "../controllers/marketController";

const router = Router();

// Listar una carta en el mercado
router.post("/list", authMiddleware, listCard);

// Ver mercado (todas las cartas activas de otros usuarios)
router.get("/", authMiddleware, getMarket);

// Comprar carta
router.post("/buy/:listingId", authMiddleware, buyCard);

// Cancelar anuncio
router.post("/cancel/:listingId", authMiddleware, cancelListing);

export default router;
