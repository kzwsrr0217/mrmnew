// mrmnew/backend/src/logistics/logistics.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hardware, HardwareType } from 'src/hardware/hardware.entity';
import { System } from 'src/systems/system.entity';
import { Repository } from 'typeorm';
import { LogisticsItem, LogisticsItemStatus } from './entities/logistics-item.entity';
import { CreateLogisticsItemDto } from './dto/create-logistics-item.dto';
import { AssignLogisticsItemDto } from './dto/assign-logistics-item.dto';

@Injectable()
export class LogisticsService {
    constructor(
        @InjectRepository(LogisticsItem) private itemRepo: Repository<LogisticsItem>,
        @InjectRepository(Hardware) private hardwareRepo: Repository<Hardware>,
        @InjectRepository(System) private systemRepo: Repository<System>,
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
    async assignItemToSystem(dto: AssignLogisticsItemDto): Promise<Hardware> {
        const item = await this.itemRepo.findOneBy({ id: dto.itemId });
        if (!item || item.status !== LogisticsItemStatus.RAKTARON) {
            throw new NotFoundException('A tétel nem található vagy már ki van adva.');
        }

        const system = await this.systemRepo.findOneBy({ systemid: dto.systemId });
        if (!system) {
            throw new NotFoundException('A célrendszer nem található.');
        }

        const newHardware = this.hardwareRepo.create({
            model_name: item.name,          // Név -> Modell
            serial_number: item.serial_number, // Gyári szám -> Sorozatszám
            type: dto.type,                 // A felhasználó által választott típus
            notes: dto.notes,               // A felhasználó által írt megjegyzés
            system: system,
        });
        const savedHardware = await this.hardwareRepo.save(newHardware);

        item.status = LogisticsItemStatus.KIADVA;
        item.assigned_hardware = savedHardware;
        await this.itemRepo.save(item);

        return savedHardware;
    }
}