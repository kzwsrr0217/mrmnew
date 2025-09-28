// mrm-backend/src/classifications/classification.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export enum ClassificationType {
  NEMZETI = 'NEMZETI',
  NATO = 'NATO',
  EU = 'EU',
}

@Entity('classification_levels')
@Unique(['type', 'level_name'])
export class ClassificationLevel {
  @PrimaryGeneratedColumn()
  classification_id: number;

  @Column({
    type: 'enum',
    enum: ClassificationType,
  })
  type: ClassificationType;

  @Column({ length: 100 })
  level_name: string;

  @Column({ type: 'int' })
  rank: number; 
  // A @ManyToMany kapcsolatot innen teljesen töröltük.
}