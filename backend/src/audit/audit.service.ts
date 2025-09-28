import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Visszaadja az összes naplóbejegyzést, a legfrissebbel kezdve.
   */
  findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: {
        timestamp: 'DESC',
      },
    });
  }
}