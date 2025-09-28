// mrm-backend/src/hardware/hardware.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Hardware, HardwareType } from './hardware.entity';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { System } from '../systems/system.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { Software } from '../software/software.entity';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

@Injectable()
export class HardwareService {
  constructor(
    @InjectRepository(Hardware) private hardwareRepo: Repository<Hardware>,
    @InjectRepository(System) private systemRepo: Repository<System>,
    @InjectRepository(ClassificationLevel) private classificationRepo: Repository<ClassificationLevel>,
    @InjectRepository(Software) private softwareRepo: Repository<Software>,
  ) {}

  async create(dto: CreateHardwareDto): Promise<Hardware> {
    const system = await this.systemRepo.findOneBy({ systemid: dto.system_id });
    if (!system) {
      throw new NotFoundException(`A(z) ${dto.system_id} azonosítójú rendszer nem található.`);
    }
    
    const hardware = this.hardwareRepo.create(dto);
    hardware.system = system;

    if (dto.parent_hardware_id && dto.parent_hardware_id !== null) {
      const parent = await this.hardwareRepo.findOneBy({ hardware_id: dto.parent_hardware_id });
      if (!parent) {
        throw new NotFoundException(`A(z) ${dto.parent_hardware_id} azonosítójú szülő hardver nem található.`);
      }
      hardware.parent_hardware = parent;
    }

    if (dto.classification_ids && dto.classification_ids.length > 0) {
      const classifications = await this.classificationRepo.findBy({
        classification_id: In(dto.classification_ids),
      });
      if (classifications.length !== dto.classification_ids.length) {
        throw new NotFoundException('Egy vagy több megadott minősítés nem található.');
      }
      hardware.classifications = classifications;
    }
    
    if (hardware.storage_size_gb === '' as any) hardware.storage_size_gb = null;

    if (hardware.type !== HardwareType.MUNKAALLOMAS) {
      hardware.workstation_type = null;
    }
    if (hardware.type !== HardwareType.ADATTAROLO) {
      hardware.inventory_number = null;
      hardware.storage_size_gb = null;
      hardware.storage_type = null;
      hardware.parent_hardware = null; 
    }
    if (hardware.is_tempest !== true) {
      hardware.tempest_level = null;
      hardware.tempest_cert_number = null;
      hardware.tempest_number = null;
    }
    
    return this.hardwareRepo.save(hardware);
  }

  findAllForSystem(systemId: number): Promise<Hardware[]> {
    return this.hardwareRepo.find({
      where: { system: { systemid: systemId } },
      relations: ['classifications', 'parent_hardware', 'installed_software'],
    });
  }

  async addSoftwareToHardware(hardwareId: number, softwareId: number): Promise<Hardware> {
    const hardware = await this.hardwareRepo.findOne({
      where: { hardware_id: hardwareId },
      relations: ['installed_software'],
    });
    if (!hardware) {
      throw new NotFoundException('Hardver nem található.');
    }

    const software = await this.softwareRepo.findOneBy({ software_id: softwareId });
    if (!software) {
      throw new NotFoundException('Szoftver nem található.');
    }

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

  async update(id: number, updateHardwareDto: UpdateHardwareDto): Promise<Hardware> {
    const hardware = await this.hardwareRepo.preload({
      hardware_id: id,
      ...updateHardwareDto,
    });

    if (!hardware) {
      throw new NotFoundException(`A(z) ${id} azonosítójú hardver nem található.`);
    }

    return this.hardwareRepo.save(hardware);
  }
}