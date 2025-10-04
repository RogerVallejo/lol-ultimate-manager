import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from "typeorm";
import { User } from "./User";
import { Card } from "./Card";
import { Match } from "./Match";

@Entity("teams")
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => User, (user) => user.teams)
  owner!: User;

  @OneToMany(() => Card, (card) => card.team)
  cards!: Card[];

  // 🔹 Relaciones inversas para partidos
  @OneToMany(() => Match, (match) => match.homeTeam)
  homeMatches!: Match[];

  @OneToMany(() => Match, (match) => match.awayTeam)
  awayMatches!: Match[];
}
