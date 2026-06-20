import { Injectable, inject } from '@angular/core';
import { WaterIncidentRepository } from '../../domain/repositories/water-incident.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';
import { ResolutionType } from '../../domain/entities/incident-resolution.entity';

@Injectable()
export class ResolveIncidentUseCase {
  private readonly repo = inject(WaterIncidentRepository);
  private readonly eventBus = inject(DomainEventBus);

  execute(incidentId: string, resolvedBy: string, type: ResolutionType, notes: string, actualLossLiters: number): void {
    const incident = this.repo.findById(incidentId);
    if (!incident) throw new Error(`Incidente ${incidentId} no encontrado`);

    incident.resolveIncident({ resolvedBy, type, notes, actualLossLiters });
    this.repo.save(incident);
    this.eventBus.dispatchFromAggregate(incident);
  }
}
