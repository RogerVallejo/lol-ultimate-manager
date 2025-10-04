import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Match } from "../entities/Match";
import { Team } from "../entities/Team";
import { User } from "../entities/User";

const matchRepository = AppDataSource.getRepository(Match);
const teamRepository = AppDataSource.getRepository(Team);
const userRepository = AppDataSource.getRepository(User);

// Simulación simple del resultado según ratings
const simulateMatch = (homeRating: number, awayRating: number) => {
  const randomness = () => Math.floor(Math.random() * 10); // un poco de suerte

  const homeScore = Math.floor(homeRating / 20) + randomness();
  const awayScore = Math.floor(awayRating / 20) + randomness();

  let winner = "draw";
  if (homeScore > awayScore) winner = "home";
  else if (awayScore > homeScore) winner = "away";

  return { homeScore, awayScore, winner };
};

export const playMatch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { teamId } = req.body;

    const user = await userRepository.findOne({
      where: { id: userId }
    });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Buscar equipo del usuario
    const homeTeam = await teamRepository.findOne({
      where: { id: teamId, owner: { id: userId } },
      relations: ["cards", "owner", "cards.player"],
    });
    if (!homeTeam) return res.status(404).json({ message: "Equipo no encontrado" });

    // ✅ Validar que tiene exactamente 5 jugadores
    if (homeTeam.cards.length !== 5) {
      return res.status(400).json({
        message: "El equipo debe tener exactamente 5 jugadores para poder jugar un partido",
      });
    }

    // ✅ Validar que los 5 roles son únicos
    const roles = homeTeam.cards.map((c) => c.player.role);
    const uniqueRoles = new Set(roles);
    if (uniqueRoles.size !== 5) {
      return res.status(400).json({
        message: "El equipo debe tener un jugador por cada rol (TOP, JUNGLE, MID, ADC, SUPPORT)",
      });
    }

    // Buscar todos los equipos con jugadores y dueños
    const allTeams = await teamRepository.find({ relations: ["cards", "cards.player", "owner"] });

    // Filtrar rivales válidos
    const rivals = allTeams.filter((t) => {
      if (t.id === homeTeam.id) return false; // no jugar contra sí mismo
      if (t.cards.length !== 5) return false; // debe tener 5 cartas justas

      const roles = t.cards.map((c) => c.player.role);
      const uniqueRoles = new Set(roles);
      if (uniqueRoles.size !== 5) return false; // roles duplicados

      return true; // rival válido
    });

    if (rivals.length === 0) {
      return res.status(400).json({ message: "No hay rivales válidos disponibles" });
    }

    // Seleccionar un rival al azar
    const awayTeam = rivals[Math.floor(Math.random() * rivals.length)];


    // Calcular rating total de cada equipo
    const homeRating = homeTeam.cards.reduce((sum, c) => sum + c.rating, 0);
    const awayRating = awayTeam.cards.reduce((sum, p) => sum + p.rating, 0);

    // Simular partido
    const { homeScore, awayScore, winner } = simulateMatch(homeRating, awayRating);

    const match = matchRepository.create({
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      winner,
    });

    await matchRepository.save(match);

    // 🔹 Recompensa de 300 al ganador
    if (winner == "home") {
      user.budget += 300
      userRepository.save(user)
    }

    return res.json({
      message: "Partido jugado",
      match,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al jugar partido" });
  }
};

// Obtener historial de partidos de un usuario
export const getUserMatches = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const matches = await matchRepository.find({
      where: [
        { homeTeam: { owner: { id: userId } } },
        { awayTeam: { owner: { id: userId } } },
      ],
      relations: ["homeTeam", "awayTeam"],
    });

    return res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener historial de partidos" });
  }
};
