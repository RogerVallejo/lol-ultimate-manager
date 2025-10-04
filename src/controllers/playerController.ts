import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Player } from "../entities/Player";

const playerRepository = AppDataSource.getRepository(Player);

// Poblar la tabla con jugadores ficticios
export const seedPlayers = async (req: Request, res: Response) => {
  try {
    const count = await playerRepository.count();
    if (count > 0) {
      return res.status(400).json({ message: "Ya existen jugadores en la BD" });
    }

    const players = [
      { name: "Faker", role: "mid", rating: 98, price: 2000 },
      { name: "Caps", role: "mid", rating: 94, price: 1800 },
      { name: "Ruler", role: "adc", rating: 96, price: 1900 },
      { name: "Oner", role: "jungle", rating: 92, price: 1700 },
      { name: "Zeus", role: "top", rating: 93, price: 1750 },
      { name: "Keria", role: "support", rating: 95, price: 1850 },
      { name: "Chovy", role: "mid", rating: 91, price: 1600 },
      { name: "Peanut", role: "jungle", rating: 90, price: 1550 },
      { name: "369", role: "top", rating: 92, price: 1650 },
      { name: "Mikyx", role: "support", rating: 89, price: 1500 },
    ];

    for (const player of players) {
      const exists = await playerRepository.findOne({ where: { name: player.name } });
      if (!exists) {
        await playerRepository.save(player);
      }
    }

    return res.status(201).json({ message: "Jugadores insertados correctamente", players });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al poblar jugadores" });
  }
};

// Obtener todos los jugadores
export const getPlayers = async (req: Request, res: Response) => {
  try {
    const players = await playerRepository.find();
    return res.json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener jugadores" });
  }
};
