import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Team } from "../entities/Team";
import { User } from "../entities/User";
import { Card } from "../entities/Card";
import { In } from "typeorm";

const teamRepository = AppDataSource.getRepository(Team);
const userRepository = AppDataSource.getRepository(User);
const cardRepository = AppDataSource.getRepository(Card);

// Crear un nuevo equipo para el usuario autenticado
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { teamName, cardIds } = req.body;
    const userId = (req as any).userId;

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Buscar las cartas
    const cards = cardIds?.length
      ? await cardRepository.find({
          where: { id: In(cardIds) },
          relations: ["player", "owner"],
        })
      : [];

    if (cards.length !== 5) {
      return res.status(400).json({ message: "Debes seleccionar exactamente 5 cartas" });
    }

    // Validar que todas las cartas son del usuario
    const invalid = cards.filter((c) => c.owner.id !== userId);
    if (invalid.length > 0) {
      return res.status(403).json({ message: "Algunas cartas no te pertenecen" });
    }

    // Validar roles únicos
    const roles = cards.map((c) => c.player.role);
    const uniqueRoles = new Set(roles);
    if (uniqueRoles.size !== 5) {
      return res.status(400).json({ message: "Cada rol debe estar cubierto una sola vez" });
    }

    // Crear el equipo
    const team = teamRepository.create({
      name: teamName,
      owner: user,
      cards,
    });

    await teamRepository.save(team);

    return res.status(201).json({ message: "Equipo creado con éxito", team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el equipo" });
  }
};


// Obtener equipos del usuario autenticado
export const getUserTeams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // viene del token

    const teams = await teamRepository.find({
      where: { owner: { id: Number(userId) } },
      relations: ["cards", "owner"],
    });

    return res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener equipos" });
  }
};

export const addCardToTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { teamId, cardId } = req.body;

    const team = await teamRepository.findOne({
      where: { id: teamId, owner: { id: userId } },
      relations: ["owner", "cards", "cards.player"],
    });
    if (!team) return res.status(404).json({ message: "Equipo no encontrado o no pertenece al usuario" });

    const card = await cardRepository.findOne({
      where: { id: cardId },
      relations: ["owner", "team", "player"],
    });
    if (!card) return res.status(404).json({ message: "Carta no encontrada" });
    if (card.owner.id !== userId) return res.status(403).json({ message: "Esa carta no es tuya" });
    if (card.team) return res.status(400).json({ message: "La carta ya está asignada a un equipo" });

    // Validar rol único
    const roleAlreadyUsed = team.cards.some((c) => c.player.role === card.player.role);
    if (roleAlreadyUsed) {
      return res.status(400).json({ message: `Ya tienes un ${card.player.role} en este equipo` });
    }

    // Añadir carta
    card.team = team;
    await cardRepository.save(card);

    return res.json({ message: "Carta añadida al equipo", card });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al añadir carta al equipo" });
  }
};


// Quitar una carta de un equipo
export const removeCardFromTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { teamId, cardId } = req.body;

    const team = await teamRepository.findOne({
      where: { id: teamId, owner: { id: userId } },
      relations: ["owner", "cards"],
    });

    if (!team) return res.status(404).json({ message: "Equipo no encontrado o no pertenece al usuario" });

    const card = await cardRepository.findOne({
      where: { id: cardId, team: { id: teamId } },
      relations: ["owner", "team", "player"],
    });

    if (!card) return res.status(404).json({ message: "La carta no está en este equipo" });

    // Quitar la carta del equipo
    card.team = null;
    await cardRepository.save(card);

    return res.json({ message: "Carta eliminada del equipo", card });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar carta del equipo" });
  }
};

// Obtener plantilla de un equipo
export const getTeamRoster = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { teamId } = req.params;

    const team = await teamRepository.findOne({
      where: { id: Number(teamId), owner: { id: userId } },
      relations: ["owner", "cards", "cards.player"],
    });

    if (!team) {
      return res.status(404).json({ message: "Equipo no encontrado o no pertenece al usuario" });
    }

    return res.json({
      id: team.id,
      name: team.name,
      owner: team.owner.username,
      cards: team.cards.map((card) => ({
        id: card.id,
        playerName: card.player.name,
        rating: card.rating,
        rarity: card.rarity,
        fitness: card.fitness,
        value: card.value,
      })),   
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la plantilla del equipo" });
  }
};
