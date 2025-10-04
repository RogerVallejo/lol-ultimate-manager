import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Team } from "./Team";
import { Card } from "./Card";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;
  
  @Column()
  password!: string;

  @Column({ default: 1000 })
  budget!: number;

  @OneToMany(() => Team, (team: Team) => team.owner)
  teams!: Team[];

  @OneToMany(() => Card, (card: Card) => card.owner)
  cards!: Card[];
}

