// mrmnew/backend/src/forms/forms.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Personel } from '../personel/personel.entity';
import { Repository } from 'typeorm';
import { System } from '../systems/system.entity';
import { GenerateAccessRequestDto, MuveletTipus } from './dto/generate-access-request.dto';
import { PDFDocument, PDFTextField } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Ticket, TicketPriority } from 'src/tickets/ticket.entity';
import { User } from 'src/users/user.entity';
import * as fontkit from '@pdf-lib/fontkit';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Personel)
    private personelRepository: Repository<Personel>,
    @InjectRepository(System)
    private systemRepository: Repository<System>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
  ) {}

  async generateAccessRequestPdf(dto: GenerateAccessRequestDto): Promise<Uint8Array> {
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'hozzaferesi_kerelem_sablon.pdf');
    const pdfTemplateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(pdfTemplateBytes);

    const fontPath = path.join(process.cwd(), 'src', 'templates', 'DejaVuSans.ttf');
    const fontBytes = await fs.readFile(fontPath);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const form = pdfDoc.getForm();
    const system = await this.systemRepository.findOne({ where: { systemid: dto.systemId }, relations: ['permit', 'permit.nemzeti_classification', 'permit.nato_classification', 'permit.eu_classification'] });
    if (!system) throw new NotFoundException(`Rendszer nem található: ${dto.systemId}`);

    // Felső rész kitöltése
    form.getTextField('nyilvantartasi_szam').setText(dto.nyilvantartasi_szam);
    form.getTextField('felelos_szervezet').setText(dto.felelos_szervezet);
    form.getTextField('rendszer_neve').setText(system.systemname);
    form.getTextField('telepitesi_hely').setText(dto.telepitesi_hely || '');

    // Felhasználói táblázat kitöltése
    for (let i = 0; i < dto.users.length && i < 8; i++) { // Maximum 8 felhasználó a sablon alapján
        const userOp = dto.users[i];
        const user = await this.personelRepository.findOne({ where: { personel_id: userOp.personelId }, relations: ['personal_security_data', 'personal_security_data.nemzeti_szint', 'personal_security_data.nato_szint', 'personal_security_data.eu_szint'] });
        if (!user || !user.personal_security_data) continue;

        const prefix = `user_${i + 1}`;
        const psd = user.personal_security_data;
        const certLines = [];

        if (system.permit?.nemzeti_classification && psd.nemzeti_szint && psd.szbt_lejarat) {
            const date = this.formatDateForPdf(psd.szbt_lejarat);
            const level = this.getShortLevelName(psd.nemzeti_szint.level_name);
            certLines.push(`${date} ${level}`);
        }
        if (system.permit?.nato_classification && psd.nato_szint && psd.nato_lejarat) {
            const date = this.formatDateForPdf(psd.nato_lejarat);
            const level = this.getShortLevelName(psd.nato_szint.level_name);
            certLines.push(`${date} ${level}`);
        }
        if (system.permit?.eu_classification && psd.eu_szint && psd.eu_lejarat) {
            const date = this.formatDateForPdf(psd.eu_lejarat);
            const level = this.getShortLevelName(psd.eu_szint.level_name);
            certLines.push(`${date} ${level}`);
        }

        form.getTextField(`${prefix}_muvelet`).setText(userOp.muvelet[0]); // L, M, T
        form.getTextField(`${prefix}_nev`).setText(`${user.nev}, ${psd.rendfokozat || ''}`);
        form.getTextField(`${prefix}_beosztas`).setText(psd.beosztas || '');
        form.getTextField(`${prefix}_telefon`).setText(userOp.telefonszam || '');
        form.getTextField(`${prefix}_tanusitvany`).setText(certLines.join('\n'));
        form.getTextField(`${prefix}_megjegyzes`).setText(userOp.megjegyzes || '');
    }
    
    // Alsó rész kitöltése
    form.getTextField('form_megjegyzes').setText(dto.form_megjegyzes || '');
    form.getTextField('ugyintezo').setText(dto.ugyintezo);
    form.getTextField('kapja_1').setText(dto.kapja_1);
    form.getTextField('kapja_2').setText(dto.kapja_2);

    const fields = form.getFields();
    fields.forEach(field => {
        if (field instanceof PDFTextField) {
            try {
                field.updateAppearances(customFont);
            } catch (error) {
                console.error(`Hiba a mező (${field.getName()}) kinézetének frissítésekor: ${error.message}`);
            }
        }
    });

    form.flatten();
    return pdfDoc.save();
  }

  async generatePdfAndCreateTicket(dto: GenerateAccessRequestDto, requester: User): Promise<Uint8Array> {
    const pdfBytes = await this.generateAccessRequestPdf(dto);
    const system = await this.systemRepository.findOneBy({ systemid: dto.systemId });
    if (!system) throw new NotFoundException('A kérelemben szereplő rendszer nem található.');

    const newTicket = this.ticketRepo.create({
      title: `[PDF] Hozzáférés végrehajtása: ${system.systemname}`,
      description: `A csatolt (kinyomtatott és elküldött) PDF alapján a hozzáférések létrehozása megtörtént a távoli rendszeradminisztrátor által. A ticket lezárásával a hozzáférések rögzítésre kerülnek az MRM rendszerben.`,
      priority: TicketPriority.NORMAL,
      assignee: requester,
      creator: null,
      metadata: {
        type: 'PDF_ACCESS_REQUEST',
        data: dto,
      }
    });
    await this.ticketRepo.save(newTicket);
    
    return pdfBytes;
  }

  private formatDateForPdf(date: Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0].replace(/-/g, '.') + '.';
  }

  private getShortLevelName(levelName: string): string {
    const name = levelName.toUpperCase();
    if (name.includes('KORLÁTOZOTT')) return 'NKT';
    if (name.includes('BIZALMAS')) return 'NB';
    if (name.includes('TITKOS')) return 'NT';
    if (name.includes('SZIGORÚAN TITKOS')) return 'NSZT';
    if (name.includes('NATO RESTRICTED')) return 'NR';
    if (name.includes('NATO CONFIDENTIAL')) return 'NC';
    if (name.includes('NATO SECRET')) return 'NS';
    if (name.includes('COSMIC TOP SECRET')) return 'CTS';
    if (name.includes('RESTREINT UE/EU RESTRICTED')) return 'EUR';
    if (name.includes('CONFIDENTIEL UE/EU CONFIDENTIAL')) return 'EUC';
    if (name.includes('SECRET UE/EU SECRET')) return 'EUS';
    if (name.includes('TRÈS SECRET UE/EU TOP SECRET')) return 'EUTS';
    return levelName;
  }
}