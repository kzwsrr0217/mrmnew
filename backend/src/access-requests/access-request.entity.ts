// mrmnew/backend/src/access-requests/access-request.entity.ts

import { Personel } from '../personel/personel.entity';
import { System } from '../systems/system.entity';
import { User } from '../users/user.entity';
import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AccessLevel } from '../system-access/system-access.entity';

export enum RequestStatus {
  BV_JOVAHAGYASRA_VAR = 'BV jóváhagyásra vár',
  ENGEDELYEZVE = 'Engedélyezve (Ticket létrehozva RA számára)', // Pontosabb állapot
  VEGREHAJTVA = 'Végrehajtva',
  ELUTASITVA = 'Elutasítva',
}

@Entity('access_requests')
export class AccessRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Personel, { eager: true })
  @JoinColumn({ name: 'personel_id' })
  personel: Personel;

  @ManyToOne(() => System, { eager: true })
  @JoinColumn({ name: 'system_id' })
  system: System;

  @Column({ type: 'enum', enum: AccessLevel })
  access_level: AccessLevel;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.BV_JOVAHAGYASRA_VAR }) // Alapértelmezett állapot módosítva
  status: RequestStatus;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'requester_id' })
  requester: User; // Aki létrehozta (RBF)



  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'bv_approver_id' })
  bv_approver: User; // Aki BV/HBV/HHBV-ként jóváhagyta vagy elutasította

  @Column({ type: 'text', nullable: true })
  rejection_reason: string; // Elutasítás indoklása

  @CreateDateColumn()
  created_at: Date;
}