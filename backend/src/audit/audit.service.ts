// mrmnew/backend/src/audit/audit.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditQueryDto } from './dto/audit-query.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    // --- ÚJ REPO ---
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Visszaadja a naplóbejegyzéseket szűrve és lapozva.
   */
  async findAll(query: AuditQueryDto): Promise<{ data: AuditLog[]; total: number }> {
    const { page = 1, limit = 10, userId, action, entity, dateFrom, dateTo } = query;

    const qb = this.auditLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user'); // Join a felhasználó táblával

    // --- Dinamikus szűrő feltételek ---
    if (userId) {
      qb.andWhere('log.user_id = :userId', { userId });
    }
    if (action) {
      qb.andWhere('log.action = :action', { action });
    }
    if (entity) {
      qb.andWhere('log.entity = :entity', { entity });
    }

    // --- Dátum szűrés ---
    if (dateFrom && dateTo) {
      qb.andWhere('log.timestamp BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
    } else if (dateFrom) {
      qb.andWhere('log.timestamp >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      // Ha csak 'dateTo' van, állítsuk az időt a nap végére
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      qb.andWhere('log.timestamp <= :endDate', { endDate });
    }
    
    // --- Lapozás ---
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('log.timestamp', 'DESC'); // Sorrend

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Visszaadja a szűrő opciókat a frontend dropdownokhoz
   */
  async getFilterOptions(): Promise<any> {
    const users = await this.userRepository.find({
      select: ['id', 'username'],
      order: { username: 'ASC' }
    });

    const actionsQuery = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.action', 'action')
      .orderBy('action')
      .getRawMany();
    
    const entitiesQuery = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.entity', 'entity')
      .orderBy('entity')
      .getRawMany();

    // A .getRawMany() { action: '...' } formátumot ad, ezt alakítjuk
    const actions = actionsQuery.map(a => a.action);
    const entities = entitiesQuery.map(e => e.entity);

    return { users, actions, entities };
  }
}