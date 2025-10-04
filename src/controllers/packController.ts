import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Player } from "../entities/Player";
import { Card } from "../entities/Card";

const userRepo = AppDataSource.getRepository(User);
const playerRepo = AppDataSource.getRepository(Player);
const cardRepo = AppDataSource.getRepository(Card);

// Config sobres
const PACKS = {
    1: { cost: 200 },
    3: { cost: 500 },
    5: { cost: 800 },
} as const;

type PackSize = keyof typeof PACKS;
const isPackSize = (n: number): n is PackSize => n === 1 || n === 3 || n === 5;

// Rarezas
type Rarity = "Bronce" | "Plata" | "Oro";

const RARITIES: { rarity: Rarity; probability: number; min: number; max: number }[] = [
    { rarity: "Bronce", probability: 0.5, min: 60, max: 75 },
    { rarity: "Plata", probability: 0.35, min: 70, max: 85 },
    { rarity: "Oro", probability: 0.15, min: 80, max: 95 },
];

// Función para elegir rareza
const pickRarity = (): { rarity: Rarity; rating: number } => {
    const rand = Math.random();
    let cumulative = 0;

    for (const r of RARITIES) {
        cumulative += r.probability;
        if (rand <= cumulative) {
            const rating = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
            return { rarity: r.rarity, rating };
        }
    }

    // fallback (debería ser imposible)
    return { rarity: "Bronce", rating: 60 };
};

// 📦 Abrir sobre
export const openPack = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const sizeNum = Number(req.body.size);

        if (!isPackSize(sizeNum)) {
            return res.status(400).json({ message: "Tamaño de sobre inválido (1, 3 o 5)" });
        }

        const pack = PACKS[sizeNum];
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        if (user.budget < pack.cost) {
            return res.status(400).json({ message: "No tienes suficiente presupuesto" });
        }

        // Descontar coste
        user.budget -= pack.cost;
        await userRepo.save(user);

        // Catálogo de jugadores
        const allPlayers = await playerRepo.find();
        if (allPlayers.length === 0) {
            return res.status(400).json({ message: "No hay jugadores en el catálogo" });
        }

        // Generar cartas con rareza
        const newCards: Card[] = [];
        for (let i = 0; i < sizeNum; i++) {
            const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
            const { rarity, rating } = pickRarity();

            const card = cardRepo.create({
                owner: user,
                player: randomPlayer,
                rating,
                rarity, // ✅ persistimos la rareza
                fitness: 100,
                value: Math.floor(pack.cost / sizeNum),
                team: null,
            });

            newCards.push(card);
        }

        await cardRepo.save(newCards);

        return res.json({
            message: `Sobre de ${sizeNum} abierto con éxito`,
            cards: newCards.map((c) => ({
                id: c.id,
                player: c.player,
                rating: c.rating,
                rarity: c.rarity, // ✅ ahora viene de DB
                fitness: c.fitness,
                value: c.value,
            })),
            remainingBudget: user.budget,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al abrir sobre" });
    }
};

// 📦 Consultar precios
export const getPackPrices = (_req: Request, res: Response) => {
    return res.json(PACKS);
};