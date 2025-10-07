import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Match } from "../entities/Match";

const userRepository = AppDataSource.getRepository(User);
const matchRepository = AppDataSource.getRepository(Match)

// 👉 Registro
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Verificar que no exista ya
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = userRepository.create({
      username,
      email,
      password: hashedPassword,
      budget: 1000,
    });

    await userRepository.save(user);

    // Ocultar password antes de devolver
    const { password: _, ...safeUser } = user;

    // Generar token también en registro (más cómodo)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secreto",
      { expiresIn: "1h" }
    );

    return res
      .status(201)
      .json({ message: "Usuario creado con éxito", user: safeUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el registro" });
  }
};

// 👉 Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secreto",
      { expiresIn: "1h" }
    );

    // Quitar password del user antes de devolver
    const { password: _, ...safeUser } = user;

    return res.json({ message: "Login exitoso", user: safeUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el login" });
  }
};

// 👉 Añadir dinero al usuario
export const addMoney = async (id: number, win: number) => {
  const user = await userRepository.findOne({ where: { id } });
  if (!user) {
    return null;
  }

  user.budget += win;
  await userRepository.save(user);

  const { password: _, ...safeUser } = user;
  return safeUser;
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["cards", "teams"],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔹 Obtener últimos 5 partidos del usuario
    const matches = await matchRepository.find({
      where: [
        { homeTeam: { owner: { id: userId } } },
        { awayTeam: { owner: { id: userId } } },
      ],
      relations: ["homeTeam", "awayTeam", "homeTeam.owner", "awayTeam.owner"],
      order: { id: "DESC" },
      take: 5,
    });

    const matchHistory = matches.map((m) => {
      let result: "victoria" | "derrota" | "empate";

      if (m.homeScore === m.awayScore) {
        result = "empate";
      } else {
        const isHome = m.homeTeam.owner.id === userId;

        if (isHome) {
          result = m.homeScore > m.awayScore ? "victoria" : "derrota";
        } else {
          result = m.awayScore > m.homeScore ? "victoria" : "derrota";
        }
      }

      return {
        id: m.id,
        rival: m.homeTeam.owner.id === userId ? m.awayTeam.owner.username : m.homeTeam.owner.username,
        result,
        score: `${m.homeScore} - ${m.awayScore}`,
      };
    });

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      budget: user.budget,
      totalCards: user.cards?.length || 0,
      totalTeams: user.teams?.length || 0,
      lastMatches: matchHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la información del usuario" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  const user = await userRepository.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await userRepository.save(user);

  return res.json({ message: "Contraseña actualizada con éxito" });
};

