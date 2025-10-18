import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { System } from 'src/systems/system.entity';
import { Ticket, TicketPriority, TicketStatus } from 'src/tickets/ticket.entity';
import { PortUnlockLog, LogStatus } from 'src/port-unlocking-log/port-unlock-log.entity';
import { AccessRequest, RequestStatus } from 'src/access-requests/access-request.entity';
import { ReportsService } from 'src/reports/reports.service';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(System) private readonly systemRepo: Repository<System>,
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(PortUnlockLog) private readonly portUnlockRepo: Repository<PortUnlockLog>,
    @InjectRepository(AccessRequest) private readonly accessRequestRepo: Repository<AccessRequest>,
    private readonly reportsService: ReportsService,
    private readonly auditService: AuditService,
  ) {}

  async getDashboardWidgets() {
    // 1. Akcióra váró feladatok
    const pendingPortUnlocks = await this.portUnlockRepo.count({ where: { status: LogStatus.PENDING } });
    
    // JAVÍTVA: Az enum helyes tagját, a 'Fuggoben'-t használjuk
    const pendingAccessRequests = await this.accessRequestRepo.count({ where: { status: RequestStatus.BV_JOVAHAGYASRA_VAR } });
    
    // JAVÍTVA: A TicketStatus helyes tagját, az 'UJ'-t használjuk
    const highPriorityTickets = await this.ticketRepo.find({
      where: { status: TicketStatus.UJ, priority: TicketPriority.MAGAS },
      order: { created_at: 'DESC' },
      take: 5,
    });

    // 2. Figyelmeztető panelek
    const expiringCerts = await this.reportsService.findExpiringCertificates(1);
    const expiringPermits = await this.reportsService.findExpiringPermits(2);
    
    const systemStatusDistribution = await this.systemRepo
      .createQueryBuilder('system')
      .select('system.status', 'status')
      .addSelect('COUNT(system.systemid)', 'count')
      .groupBy('system.status')
      .getRawMany();

    // 3. Legutóbbi aktivitás
    // JAVÍTVA: Az auditService.findAll metódus nem vár paramétert a te kódodban.
    // Lekérjük az összeset és a kódban vesszük az utolsó 5-öt.
    const auditLogResponse = await this.auditService.findAll({});
    const recentAuditLogs = auditLogResponse.data // <-- JAVÍTÁS (52. sor környéke)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    return {
      actionItems: {
        pendingPortUnlocks,
        pendingAccessRequests,
        highPriorityTickets,
      },
      warnings: {
        expiringCertificatesCount: expiringCerts.length,
        expiringPermitsCount: expiringPermits.length,
        systemStatusDistribution,
      },
      activity: {
        recentAuditLogs,
      },
    };
  }
}