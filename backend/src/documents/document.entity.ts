// mrmnew/backend/src/documents/document.entity.ts

import { System } from '../systems/system.entity';
import { User } from '../users/user.entity'; // <-- 1. Győződj meg róla, hogy ez az import itt van!
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

export enum DocumentType {
  RENDSZERENGEDELY = 'Rendszerengedély',
  UBSZ = 'Üzemeltetés Biztonsági Szabályzat',
  RBK = 'Rendszerbiztonsági Követelmények',
  HOZZAFERESI_KERELEM = 'Hozzáférési Kérelem',
  RENDSZERENGEDELY_KERELEM = 'Rendszerengedély Kérelem',
  EGYEB = 'Egyéb',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  document_id: number;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ length: 255, nullable: true })
  registration_number: string;

  @Column({ type: 'date', nullable: true })
  issue_date: Date;

  @Column({ length: 255, nullable: true })
  handler_name: string;

  @Column({ nullable: true })
  filepath: string;

  @CreateDateColumn()
  uploaded_at: Date;

  @ManyToOne(() => System, (system) => system.documents)
  @JoinColumn({ name: 'system_id' })
  system: System;

  // --- 2. ITT A HIÁNYZÓ RÉSZ ---
  @ManyToOne(() => User, { eager: true }) // Az 'eager: true' biztosítja, hogy a feltöltő adatai automatikusan betöltődjenek
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;
}