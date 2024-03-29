import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Account } from "./accounts.entity";

@Entity()
export class User {
  @PrimaryColumn("uuid")
  readonly user_id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @OneToOne((type) => Account, {
    eager: true,
  })
  @JoinColumn({ name: "account" })
  account: Account;

  constructor() {
    if (!this.user_id) {
      this.user_id = uuid();
    }
  }
}
