// mrmnew/backend/src/audit/audit-log.entity.ts

import { User } from '../users/user.entity';
import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  // Melyik felhasználó hajtotta végre a műveletet?
  // Lehet null, ha pl. a rendszer maga végez műveletet (pl. seeder)
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ActionType })
  action: ActionType;

  // Melyik entitáson (táblában) történt a változás?
  @Column()
  entity: string;

  // Mi volt az entitás azonosítója?
  @Column()
  entity_id: string;

  // A változás részletei JSON formátumban
  @Column({ type: 'json', nullable: true })
  details: object;

  @CreateDateColumn()
  timestamp: Date;
}