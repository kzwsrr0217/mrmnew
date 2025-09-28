// mrm-backend/src/documents/document.entity.ts

import { System } from '../systems/system.entity';
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
  registration_number: string; // Nyilvántartási szám

  @Column({ type: 'date', nullable: true })
  issue_date: Date; // Kiadmányozási dátum

  @Column({ length: 255, nullable: true })
  handler_name: string; // Ügyintéző neve

  @Column({ nullable: true })
  filepath: string; // A feltöltött fájl elérési útja a szerveren

  @CreateDateColumn()
  uploaded_at: Date; // A feltöltés dátuma

  @ManyToOne(() => System, (system) => system.documents)
  @JoinColumn({ name: 'system_id' })
  system: System;
}