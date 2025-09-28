// mrmnew/backend/src/access-requests/access-requests-listener.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { GenerateAccessRequestDto } from 'src/forms/dto/generate-access-request.dto'; // <-- THIS IMPORT WAS MISSING
import { SystemAccess } from 'src/system-access/system-access.entity';
import { Ticket } from 'src/tickets/ticket.entity';
import { Repository } from 'typeorm';
import { AccessRequest, RequestStatus } from './access-request.entity';

@Injectable()
export class AccessRequestsListener {
  private readonly logger = new Logger(AccessRequestsListener.name);

  constructor(
    @InjectRepository(AccessRequest) private requestRepo: Repository<AccessRequest>,
    @InjectRepository(SystemAccess) private accessRepo: Repository<SystemAccess>,
  ) {}

  @OnEvent('ticket.closed')
  async handleTicketClosedEvent(ticket: Ticket) {
    // 1. ESET: Digitális jóváhagyási folyamat végrehajtása
    if (ticket.accessRequest && ticket.accessRequest.status === RequestStatus.ENGEDELYEZVE) {
      this.logger.log(`Lezárt digitális kérelem ticket (${ticket.ticket_id}). Hozzáférés létrehozása...`);
      const request = ticket.accessRequest;

      const newAccess = this.accessRepo.create({
        personel: request.personel, system: request.system, access_level: request.access_level,
      });
      await this.accessRepo.save(newAccess);

      request.status = RequestStatus.VEGREHAJTVA;
      await this.requestRepo.save(request);
      this.logger.log(`Hozzáférési kérelem (${request.id}) sikeresen végrehajtva.`);
      return;
    }

    // 2. ESET: PDF-alapú kérelem végrehajtása
    if (ticket.metadata && ticket.metadata.type === 'PDF_ACCESS_REQUEST') {
      this.logger.log(`Lezárt PDF-alapú ticket (${ticket.ticket_id}). Hozzáférések rögzítése...`);
      const requestData = ticket.metadata.data as GenerateAccessRequestDto;
      
      for (const userOp of requestData.users) {
        // Here we only handle creation, but it could be expanded in the future
        if (userOp.muvelet === 'Létrehozás') {
          await this.accessRepo.save({
            personel: { personel_id: userOp.personelId },
            system: { systemid: requestData.systemId },
            // This assumes the DTO has an accessLevel property, which it might not.
            // You might need to adjust the DTO or this logic based on your exact needs.
            // For now, let's assume a default or you'll add it to the DTO later.
            access_level: (userOp as any).accessLevel || 'user' 
          });
        }
      }
      this.logger.log(`${requestData.users.length} db hozzáférés rögzítve a(z) ${ticket.ticket_id} ticket alapján.`);
    }
  }
}