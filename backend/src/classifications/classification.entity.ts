// mrmnew/backend/src/classifications/classification.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToMany } from 'typeorm';
import { DataHandlingPermit } from '../data-handling-permits/data-handling-permit.entity';


export enum ClassificationType {
  NEMZETI = 'NEMZETI',
  NATO = 'NATO',
  EU = 'EU',
}

@Entity('classification_levels')
@Unique(['type', 'level_name'])
export class ClassificationLevel {
  @PrimaryGeneratedColumn()
  id: number; // Javaslat: átnevezés 'classification_id'-ről

  @Column({
    type: 'enum',
    enum: ClassificationType,
  })
  type: ClassificationType;

  @Column({ length: 100 })
  level_name: string;

  @Column({ type: 'int' })
  rank: number;

  // A kapcsolat másik oldalának definiálása a helyes működéshez
  @ManyToMany(() => DataHandlingPermit, permit => permit.classification_levels)
  permits: DataHandlingPermit[];
}