import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Card } from "./Card";
import { User } from "./User";

@Entity("listings")
export class Listing {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Card, { eager: true })
  card!: Card;

  @ManyToOne(() => User, { eager: true })
  seller!: User;

  @Column()
  price!: number; // fijado por el usuario, sin restricciones

  @Column({ default: "active" })
  status!: "active" | "sold" | "cancelled";

  @CreateDateColumn()
  createdAt!: Date;
}
