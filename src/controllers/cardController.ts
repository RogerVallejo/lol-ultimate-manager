import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Card } from "../entities/Card";
import { User } from "../entities/User";

const cardRepo = AppDataSource.getRepository(Card);
const userRepo = AppDataSource.getRepository(User);

export const getMyCards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { group, sort } = req.query;

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["cards", "cards.player"],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔹 Clonar para no modificar accidentalmente el array original
    let cards = [...user.cards];

    // ✅ Ordenar (default = rating descendente)
    const sortKey = (sort as string) || "rating";
    if (sortKey === "rating") {
      cards.sort((a, b) => b.rating - a.rating);
    } else if (sortKey === "fitness") {
      cards.sort((a, b) => b.fitness - a.fitness);
    } else if (sortKey === "value") {
      cards.sort((a, b) => b.value - a.value);
    }

    // 🔹 Agrupar por rareza
    if (group === "rarity") {
      const grouped = cards.reduce(
        (acc: Record<string, any[]>, card) => {
          if (!acc[card.rarity]) acc[card.rarity] = [];
          acc[card.rarity].push(card);
          return acc;
        },
        {}
      );
      return res.json(grouped);
    }

    // 🔹 Agrupar por rol
    if (group === "role") {
      const grouped = cards.reduce(
        (acc: Record<string, any[]>, card) => {
          const role = card.player.role; // asumiendo que Player tiene "role"
          if (!acc[role]) acc[role] = [];
          acc[role].push(card);
          return acc;
        },
        {}
      );
      return res.json(grouped);
    }

    // 🔹 Por defecto → devolver todas las cartas ordenadas
    return res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las cartas" });
  }
};
