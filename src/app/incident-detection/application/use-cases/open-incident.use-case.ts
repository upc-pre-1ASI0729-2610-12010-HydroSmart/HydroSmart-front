import { Injectable, inject } from '@angular/core';
import { WaterIncidentRepository } from '../../domain/repositories/water-incident.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';
import { WaterIncident } from '../../domain/aggregates/water-incident.aggregate';
import { LeakAlert } from '../../domain/entities/leak-alert.entity';
import { IncidentSeverity } from '../../domain/enums/incident-severity.enum';

export interface OpenIncidentCommand {
  alertId: string;
  userId: string;
  deviceId: string;
  title: string;
  message: string;
  severity: IncidentSeverity;
  estimatedLossLiters: number;
}

@Injectable()
export class OpenIncidentUseCase {
  private readonly repo = inject(WaterIncidentRepository);
  private readonly eventBus = inject(DomainEventBus);

  execute(cmd: OpenIncidentCommand): WaterIncident {
    const alert = new LeakAlert(
      cmd.alertId,
      `inc-${cmd.alertId}`,
      cmd.userId,
      cmd.deviceId,
      'leak',
      cmd.title,
      cmd.message,
      cmd.severity,
      new Date(),
      cmd.estimatedLossLiters
    );

    const incident = WaterIncident.open({
      id: `inc-${cmd.alertId}`,
      userId: cmd.userId,
      deviceId: cmd.deviceId,
      initialAlert: alert,
      severity: cmd.severity
    });

    this.repo.save(incident);
    this.eventBus.dispatchFromAggregate(incident);
    return incident;
  }
}
