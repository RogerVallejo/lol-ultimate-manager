import { AppDataSource } from "../config/data-source";
import { Player } from "../entities/Player";

const seed = async () => {
  await AppDataSource.initialize();
  console.log("📦 Conectado a la BD");

  const playerRepo = AppDataSource.getRepository(Player);

  const existing = await playerRepo.count();
  if (existing > 0) {
    console.log("⚠️ Jugadores ya existen, seed cancelado.");
    await AppDataSource.destroy();
    return;
  }

  const players = [
    { name: "Faker", role: "Mid" },
    { name: "Caps", role: "Mid" },
    { name: "Rekkles", role: "ADC" },
    { name: "Zeus", role: "Top" },
    { name: "Oner", role: "Jungle" },
    { name: "Keria", role: "Support" },
    { name: "Chovy", role: "Mid" },
    { name: "Ruler", role: "ADC" },
    { name: "Knight", role: "Mid" },
    { name: "Peanut", role: "Jungle" },
  ];

  await playerRepo.save(players);

  console.log("✅ Jugadores insertados correctamente");
  await AppDataSource.destroy();
};

seed().catch((err) => {
  console.error("❌ Error ejecutando seed:", err);
});
