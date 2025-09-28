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
import { MaintenanceLog } from '../maintenance/maintenance-log.entity'; // Import entities to audit
import { System } from '../systems/system.entity';
import { Personel } from '../personel/personel.entity';


@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  constructor(private readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.targetName === 'AuditLog' || !event.entity) return;

    const log = new AuditLog();
    log.action = ActionType.CREATE;
    log.entity = event.metadata.tableName;
    log.entity_id = this.getEntityId(event.entity);
    log.details = { newValues: event.entity };

    await this.dataSource.getRepository(AuditLog).save(log);
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    if (event.metadata.targetName === 'AuditLog' || !event.entity || !event.databaseEntity) {
      return;
    }
    
    // Expliciten egy új változóba tesszük, így a TypeScript már tudja, hogy nem lehet null
    const entity = event.entity; 

    const log = new AuditLog();
    log.action = ActionType.UPDATE;
    log.entity = event.metadata.tableName;
    log.entity_id = this.getEntityId(entity);

    const changes: { [key: string]: any } = {};
    event.updatedColumns.forEach(column => {
      const propertyName = column.propertyName;
      const oldValue = event.databaseEntity[propertyName];
      const newValue = entity[propertyName]; // Itt már a `entity`-t használjuk

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[propertyName] = { oldValue, newValue };
      }
    });

    if (Object.keys(changes).length > 0) {
      log.details = changes;
      await this.dataSource.getRepository(AuditLog).save(log);
    }
  }

  async beforeRemove(event: RemoveEvent<any>) {
    if (event.metadata.targetName === 'AuditLog' || !event.databaseEntity) return;

    const log = new AuditLog();
    log.action = ActionType.DELETE;
    log.entity = event.metadata.tableName;
    log.entity_id = this.getEntityId(event.databaseEntity);
    log.details = { removedValues: event.databaseEntity };

    await this.dataSource.getRepository(AuditLog).save(log);
  }
  
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