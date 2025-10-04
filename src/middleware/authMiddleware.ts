import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Falta token de autenticación" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const secret = process.env.JWT_SECRET || "secreto";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Guardamos el userId en la request
    (req as any).userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token no válido o expirado" });
  }
};
