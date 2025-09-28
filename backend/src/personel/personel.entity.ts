// mrmnew-show/backend/src/personel/personel.entity.ts

import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { SystemAccess } from '../system-access/system-access.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('personel')
export class Personel {
  @PrimaryGeneratedColumn()
  personel_id: number;

  @Column({ length: 255 })
  nev: string;

  @OneToOne(() => PersonalSecurityData, (psd) => psd.personel, { cascade: true, eager: true })
  @JoinColumn({ name: 'psd_id' })
  personal_security_data: PersonalSecurityData;

  @OneToMany(() => SystemAccess, (access) => access.personel)
  system_accesses: SystemAccess[];
}