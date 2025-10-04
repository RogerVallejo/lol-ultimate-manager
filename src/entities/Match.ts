import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Team } from "./Team";

@Entity("matches") // tabla se llama matches
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Team, (team) => team.homeMatches)
  homeTeam!: Team;

  @ManyToOne(() => Team, (team) => team.awayMatches)
  awayTeam!: Team;

  @Column()
  homeScore!: number;

  @Column()
  awayScore!: number;

  @Column({ type: "varchar", nullable: true })
  winner!: string | null;
  
}
