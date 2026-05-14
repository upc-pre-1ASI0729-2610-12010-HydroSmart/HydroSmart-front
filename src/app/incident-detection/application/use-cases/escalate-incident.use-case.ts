import { Injectable, inject } from '@angular/core';
import { WaterIncidentRepository } from '../../domain/repositories/water-incident.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';

@Injectable()
export class EscalateIncidentUseCase {
  private readonly repo = inject(WaterIncidentRepository);
  private readonly eventBus = inject(DomainEventBus);

  execute(incidentId: string, reason: string): void {
    const incident = this.repo.findById(incidentId);
    if (!incident) throw new Error(`Incidente ${incidentId} no encontrado`);

    incident.escalateIncident(reason);
    this.repo.save(incident);
    this.eventBus.dispatchFromAggregate(incident);
  }
}
