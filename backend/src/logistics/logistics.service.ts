// mrmnew/backend/src/logistics/logistics.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hardware } from 'src/hardware/hardware.entity';
import { System } from 'src/systems/system.entity';
import { In, Repository } from 'typeorm';
import { LogisticsItem, LogisticsItemStatus } from './entities/logistics-item.entity';
import { CreateLogisticsItemDto } from './dto/create-logistics-item.dto';
import { AssignLogisticsItemDto } from './dto/assign-logistics-item.dto';
import { ClassificationLevel } from 'src/classifications/classification.entity';

@Injectable()
export class LogisticsService {
    constructor(
        @InjectRepository(LogisticsItem) private itemRepo: Repository<LogisticsItem>,
        @InjectRepository(Hardware) private hardwareRepo: Repository<Hardware>,
        @InjectRepository(System) private systemRepo: Repository<System>,
        @InjectRepository(ClassificationLevel) private classificationRepo: Repository<ClassificationLevel>,
    ) {}

    /**
     * Visszaadja az ÖSSZES logisztikai tételt, a kiadottakat is.
     */
    findAllItems() {
        return this.itemRepo.find({
            relations: ['assigned_hardware', 'assigned_hardware.system'],
            order: { id: 'DESC' }
        });
    }

    /**
     * Létrehoz egy új logisztikai tételt manuálisan.
     */
    createItem(dto: CreateLogisticsItemDto): Promise<LogisticsItem> {
        const newItem = this.itemRepo.create(dto);
        // JAVÍTVA: A save metódus egy Promise<LogisticsItem>-et ad vissza, ami már helyes.
        return this.itemRepo.save(newItem);
    }

    /**
     * Visszaadja az összes, még raktáron lévő logisztikai tételt.
     */
    findAllStockItems() {
        return this.itemRepo.find({
            where: { status: LogisticsItemStatus.RAKTARON },
            order: { name: 'ASC' }
        });
    }

    /**
     * JAVÍTOTT METÓDUS: Egy logisztikai tételt hozzárendel egy rendszerhez a DTO adatai alapján.
     */
    /**
     * JAVÍTOTT METÓDUS: Létrehoz egy teljes értékű hardver entitást a logisztikai tételből,
     * majd hozzárendeli a rendszerhez és frissíti a logisztikai státuszt.
     */
    async assignItemToSystem(dto: AssignLogisticsItemDto): Promise<Hardware> {
        const { itemId, systemId, parent_hardware_id, classification_ids, ...hardwareData } = dto;

        const item = await this.itemRepo.findOneBy({ id: itemId });
        if (!item || item.status !== LogisticsItemStatus.RAKTARON) {
            throw new NotFoundException('A tétel nem található vagy már ki van adva.');
        }

        const system = await this.systemRepo.findOneBy({ systemid: systemId });
        if (!system) {
            throw new NotFoundException('A célrendszer nem található.');
        }

        const newHardware = this.hardwareRepo.create(hardwareData);
        newHardware.system = system;

        if (parent_hardware_id) {
            const parent = await this.hardwareRepo.findOneBy({ hardware_id: parent_hardware_id });
            if (!parent) throw new NotFoundException('A szülő hardver nem található.');
            newHardware.parent_hardware = parent;
        }

        if (classification_ids && classification_ids.length > 0) {
            // JAVÍTVA: classification_id -> id
            const classifications = await this.classificationRepo.findBy({ id: In(classification_ids) });
            if (classifications.length !== classification_ids.length) throw new NotFoundException('Egy vagy több minősítés nem található.');
            newHardware.classifications = classifications;
        }
        
        const savedHardware = await this.hardwareRepo.save(newHardware);

        item.status = LogisticsItemStatus.KIADVA;
        item.assigned_hardware = savedHardware;
        await this.itemRepo.save(item);

        return savedHardware;
    }
}