// mrmnew/backend/src/audit/audit.subscriber.ts

import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuditLog, ActionType } from './audit-log.entity';
import { RequestContextService } from 'src/request-context/request-context.service';
import { User } from 'src/users/user.entity'; // User import
import { Logger } from '@nestjs/common'; // <-- ÚJ IMPORT

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  // --- ÚJ: Logger hozzáadása ---
  private readonly logger = new Logger(AuditSubscriber.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly contextService: RequestContextService,
  ) {
    dataSource.subscribers.push(this);
  }

  private getUserFromContext(): User | null {
    const user = this.contextService.getUser();
    // --- JAVÍTVA: Logolás hozzáadása ---
    if (user) {
        this.logger.log(`getUserFromContext returned user ID: ${user.id} (${user.username})`);
    } else {
        this.logger.log(`getUserFromContext returned null`);
    }
    // ---------------------------------
    return user || null;
  }

  // --- JAVÍTVA: Logika áthelyezve ide ---
async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.targetName === 'AuditLog' || !event.entity) return;
    this.logger.log(`afterInsert triggered for entity: ${event.metadata.tableName}`); // Extra log
    const log = new AuditLog();
    log.action = ActionType.CREATE;
    log.entity = event.metadata.tableName;
    log.entity_id = this.getEntityId(event.entity);
    log.details = { newValues: event.entity };
    log.user = this.getUserFromContext(); // Itt fog logolni a segédfüggvény

    try {
      await this.dataSource.getRepository(AuditLog).insert(log);
    } catch (error) {
      this.logger.error("Hiba a CREATE napló mentése közben:", error);
    }
  }

async afterUpdate(event: UpdateEvent<any>) {
      if (event.metadata.targetName === 'AuditLog' || !event.entity || !event.databaseEntity || !event.updatedColumns || event.updatedColumns.length === 0) {
        return;
      }
      this.logger.log(`afterUpdate triggered for entity: ${event.metadata.tableName}`); // Extra log
      // ... (changes kiszámítása)
      const changes: { [key: string]: any } = {};
      event.updatedColumns.forEach(column => {
        if (column.relationMetadata) { return; }
        const propertyName = column.propertyName;
        const oldValue = event.databaseEntity[propertyName];
        const newValue = event.entity[propertyName];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes[propertyName] = { oldValue, newValue };
        }
      });

      if (Object.keys(changes).length > 0) {
          const log = new AuditLog();
          log.action = ActionType.UPDATE;
          log.entity = event.metadata.tableName;
          log.entity_id = this.getEntityId(event.entity);
          log.user = this.getUserFromContext(); // Itt fog logolni a segédfüggvény
          log.details = changes;
          try {
              await this.dataSource.getRepository(AuditLog).insert(log);
          } catch (error) {
              this.logger.error("Hiba az UPDATE napló mentése közben:", error);
          }
      } else {
           this.logger.log(`afterUpdate skipped for ${event.metadata.tableName} ID ${this.getEntityId(event.entity)} because no changes detected.`); // Extra log
      }
  }


  // beforeRemove ...
  async beforeRemove(event: RemoveEvent<any>) {
    if (event.metadata.targetName === 'AuditLog' || !event.databaseEntity) return;
    this.logger.log(`beforeRemove triggered for entity: ${event.metadata.tableName}`); // Extra log
    const log = new AuditLog();
    log.action = ActionType.DELETE;
    log.entity = event.metadata.tableName;
    log.entity_id = this.getEntityId(event.databaseEntity);
    log.details = { removedValues: event.databaseEntity };
    log.user = this.getUserFromContext(); // Itt fog logolni a segédfüggvény

    try {
      if (event.queryRunner && event.queryRunner.isTransactionActive) {
         await event.queryRunner.manager.insert(AuditLog, log);
      } else {
         await this.dataSource.getRepository(AuditLog).insert(log);
         this.logger.warn(`DELETE napló mentése tranzakción kívül (${log.entity})`);
      }
    } catch (error) {
      this.logger.error("Hiba a DELETE napló mentése közben:", error);
    }
  }

  // ... (getEntityId nem változik)
   private getEntityId(entity: any): string {
    if (!entity) return 'unknown';
    const id =
        entity.id ||
        entity.ticket_id ||
        entity.personel_id ||
        entity.systemid ||
        entity.access_id ||
        entity.log_id ||
        entity.permit_id ||
        entity.software_id ||
        entity.hardware_id ||
        entity.document_id ||
        entity.classification_id ||
        entity.psd_id;
    return String(id || 'unknown');
  }
}