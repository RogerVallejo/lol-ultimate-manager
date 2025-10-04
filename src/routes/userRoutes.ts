import { Router } from "express";
import { register, login, getMe } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Registro de usuario
router.post("/register", register);

// Login de usuario
router.post("/login", login);

router.get("/me", authMiddleware, getMe);

export default router;
