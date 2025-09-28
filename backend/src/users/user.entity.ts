// mrmnew/backend/src/users/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm'; // <-- BeforeUpdate importálása
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'Admin',
  BV = 'Biztonsági vezető',
  HBV = 'Helyettes Biztonsági vezető',
  HHBV = 'Helyi Helyettes Biztonsági vezető',
  RBF = 'Rendszerbiztonsági felügyelő',
  RA = 'Rendszeradminisztrátor',
  SZBF = 'Személyi Biztonsági Felelős',
  USER = 'Felhasználó',
  ALEGYSEGPARANCSNOK = 'Alegységparancsnok',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // Nem adjuk vissza alapértelmezetten
  password?: string; // Típusdefiníció a TypeScript számára

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate() // <-- EZT A SORT ADD HOZZÁ
  async hashPassword() {
    // Csak akkor hashelünk, ha a jelszó mező megváltozott (nem üres)
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}