// mrmnew/backend/src/hardware/hardware.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Hardware, HardwareType } from './hardware.entity';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { System } from '../systems/system.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { Software } from '../software/software.entity';
import { Location } from '../locations/location.entity';

@Injectable()
export class HardwareService {
  constructor(
    @InjectRepository(Hardware) private hardwareRepo: Repository<Hardware>,
    @InjectRepository(System) private systemRepo: Repository<System>,
    @InjectRepository(ClassificationLevel) private classificationRepo: Repository<ClassificationLevel>,
    @InjectRepository(Software) private softwareRepo: Repository<Software>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
  ) {}

  async create(dto: CreateHardwareDto): Promise<Hardware> {
    const { system_id, parent_hardware_id, classification_ids, location, ...hardwareData } = dto;

    const system = await this.systemRepo.findOneBy({ systemid: system_id });
    if (!system) {
      throw new NotFoundException(`A(z) ${system_id} azonosítójú rendszer nem található.`);
    }
    
    const hardware = this.hardwareRepo.create(hardwareData);
    hardware.system = system;
    // Ha az inventory_number üres string, alakítsuk át null-ra.
    if (hardware.inventory_number === '') {
        hardware.inventory_number = null;
    }
    if (parent_hardware_id) {
      const parent = await this.hardwareRepo.findOneBy({ hardware_id: parent_hardware_id });
      if (!parent) throw new NotFoundException(`A szülő hardver nem található.`);
      hardware.parent_hardware = parent;
    }

    if (location) {
        const loc = await this.locationRepo.findOneBy({ id: location });
        if (!loc) throw new NotFoundException('A helyszín nem található.');
        hardware.location = loc;
    }

    if (classification_ids && classification_ids.length > 0) {
      const classifications = await this.classificationRepo.findBy({ id: In(classification_ids) });
      if (classifications.length !== classification_ids.length) {
        throw new NotFoundException('Egy vagy több megadott minősítés nem található.');
      }
      hardware.classifications = classifications;
    }
    
    // Adattisztítás...
    return this.hardwareRepo.save(hardware);
  }

  findAllForSystem(systemId: number): Promise<Hardware[]> {
    return this.hardwareRepo.find({
      where: { system: { systemid: systemId } },
      relations: ['classifications', 'parent_hardware', 'installed_software', 'location'],
    });
  }

  async update(id: number, dto: any): Promise<Hardware> {
    const { system_id, location, classification_ids, parent_hardware_id, ...updateData } = dto;

    const hardware = await this.hardwareRepo.findOne({
        where: { hardware_id: id },
        relations: ['classifications', 'location'],
    });

    if (!hardware) {
      throw new NotFoundException(`A(z) ${id} azonosítójú hardver nem található.`);
    }

    Object.assign(hardware, updateData);
    
    // Az update metódusban is biztosítjuk, hogy az üres string NULL legyen.
    if (hardware.inventory_number === '') {
        hardware.inventory_number = null;
    }

    if (location !== undefined) {
      hardware.location = location ? await this.locationRepo.findOneByOrFail({ id: location }) : null;
    }

    if (parent_hardware_id !== undefined) {
      hardware.parent_hardware = parent_hardware_id ? await this.hardwareRepo.findOneByOrFail({ hardware_id: parent_hardware_id }) : null;
    }

    if (classification_ids) {
        const classifications = await this.classificationRepo.findBy({ id: In(classification_ids) });
        hardware.classifications = classifications;
    }

    return this.hardwareRepo.save(hardware);
  }
  
  async addSoftwareToHardware(hardwareId: number, softwareId: number): Promise<Hardware> {
    const hardware = await this.hardwareRepo.findOne({
      where: { hardware_id: hardwareId },
      relations: ['installed_software'],
    });
    if (!hardware) throw new NotFoundException('Hardver nem található.');

    const software = await this.softwareRepo.findOneBy({ software_id: softwareId });
    if (!software) throw new NotFoundException('Szoftver nem található.');

    const isAlreadyInstalled = hardware.installed_software.some(s => s.software_id === softwareId);
    if (!isAlreadyInstalled) {
      hardware.installed_software.push(software);
      return this.hardwareRepo.save(hardware);
    }
    return hardware;
  }

  async remove(id: number): Promise<void> {
    const result = await this.hardwareRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`A(z) ${id} azonosítójú hardver nem található.`);
    }
  }
}