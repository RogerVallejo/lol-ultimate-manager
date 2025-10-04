import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Listing } from "../entities/Listing";
import { Card } from "../entities/Card";
import { User } from "../entities/User";

const listingRepo = AppDataSource.getRepository(Listing);
const cardRepo = AppDataSource.getRepository(Card);
const userRepo = AppDataSource.getRepository(User);

// Listar una carta
export const listCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { cardId, price } = req.body;

    const card = await cardRepo.findOne({ where: { id: cardId }, relations: ["owner", "team"] });
    if (!card) return res.status(404).json({ message: "Carta no encontrada" });
    if (card.owner.id !== userId) return res.status(403).json({ message: "Esa carta no es tuya" });
    if (card.team) {
      return res.status(400).json({ 
        message: `No puedes vender esta carta porque está en el equipo "${card.team.name}". Primero quítala del equipo.` 
      });
    }
    

    const listing = listingRepo.create({
      card,
      seller: card.owner,
      price,
      status: "active",
    });

    await listingRepo.save(listing);
    return res.json({ message: "Carta listada en el mercado", listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al listar carta en el mercado" });
  }
};

// Obtener mercado
export const getMarket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const listings = await listingRepo.find({
      where: { status: "active" },
      relations: ["card", "card.player", "seller"],
    });

    return res.json(listings.filter((l) => l.seller.id !== userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener mercado" });
  }
};

// Comprar carta
export const buyCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { listingId } = req.params;

    const user = await userRepo.findOne({ where: { id: userId } });
    const listing = await listingRepo.findOne({
      where: { id: Number(listingId), status: "active" },
      relations: ["card", "card.owner", "seller"],
    });

    if (!listing) return res.status(404).json({ message: "Anuncio no encontrado" });
    if (listing.seller.id === userId) return res.status(400).json({ message: "No puedes comprar tu propia carta" });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (user.budget < listing.price) {
      return res.status(400).json({ message: "No tienes suficiente presupuesto" });
    }

    // Transacción
    user.budget -= listing.price;
    listing.seller.budget += listing.price;

    listing.card.owner = user;
    listing.status = "sold";

    await userRepo.save([user, listing.seller]);
    await cardRepo.save(listing.card);
    await listingRepo.save(listing);

    return res.json({ message: "Compra realizada con éxito", card: listing.card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al comprar carta" });
  }
};

// Cancelar anuncio
export const cancelListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { listingId } = req.params;

    const listing = await listingRepo.findOne({
      where: { id: Number(listingId), status: "active" },
      relations: ["seller"],
    });

    if (!listing) return res.status(404).json({ message: "Anuncio no encontrado" });
    if (listing.seller.id !== userId) return res.status(403).json({ message: "No puedes cancelar este anuncio" });

    listing.status = "cancelled";
    await listingRepo.save(listing);

    return res.json({ message: "Anuncio cancelado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al cancelar anuncio" });
  }
};
