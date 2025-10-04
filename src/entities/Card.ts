import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Player } from "./Player";
import { Team } from "./Team";

export type Rarity = "Bronce" | "Plata" | "Oro";

@Entity("cards")
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user: User) => user.cards)
  owner!: User;

  @ManyToOne(() => Player, { eager: true })
  player!: Player;

  @ManyToOne(() => Team, (team: Team) => team.cards, { nullable: true })
  team!: Team | null;

  @Column()
  rating!: number;

  @Column()
  rarity!: Rarity; // 🔥 ahora la rareza se guarda en DB

  @Column({ default: 100 })
  fitness!: number;

  @Column({ default: 0 })
  value!: number;
}
