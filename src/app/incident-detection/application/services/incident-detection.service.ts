import { Injectable, inject, signal, computed } from '@angular/core';
import { WaterIncidentRepository } from '../../domain/repositories/water-incident.repository';
import { OpenIncidentUseCase } from '../use-cases/open-incident.use-case';
import { ResolveIncidentUseCase } from '../use-cases/resolve-incident.use-case';
import { EscalateIncidentUseCase } from '../use-cases/escalate-incident.use-case';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';
import { WaterLeakDetected } from '../../domain/events/water-leak-detected.event';
import { AnomalousConsumptionDetected } from '../../../consumption-monitoring/domain/events/anomalous-consumption-detected.event';
import { WaterIncident } from '../../domain/aggregates/water-incident.aggregate';
import { IncidentSeverity } from '../../domain/enums/incident-severity.enum';

@Injectable()
export class IncidentDetectionService {
  private readonly repo = inject(WaterIncidentRepository);
  private readonly openUseCase = inject(OpenIncidentUseCase);
  private readonly resolveUseCase = inject(ResolveIncidentUseCase);
  private readonly escalateUseCase = inject(EscalateIncidentUseCase);
  private readonly eventBus = inject(DomainEventBus);

  private _incidents = signal<WaterIncident[]>([]);
  readonly incidents = this._incidents.asReadonly();

  readonly activeIncidents = computed(() =>
    this._incidents().filter(i => i.isActive || i.isEscalated)
  );

  readonly unresolvedCount = computed(() =>
    this._incidents().filter(i => !i.isResolved).length
  );

  async initialize(userId: string): Promise<void> {
    if ('preload' in (this.repo as any)) {
      await (this.repo as any).preload('1');
    }
    this._incidents.set(this.repo.findAllByUserId(userId));
    this.registerEventListeners(userId);
  }

  acknowledgeIncident(incidentId: string): void {
    const incident = this.repo.findById(incidentId);
    if (incident) {
      incident.acknowledge();
      this.repo.save(incident);
      this._incidents.update(list =>
        list.map(i => i.id === incidentId ? incident : i)
      );
    }
  }

  resolveIncident(incidentId: string, notes: string): void {
    this.resolveUseCase.execute(incidentId, 'user', 'repaired', notes, 0);
    this._incidents.set(this.repo.findAllByUserId(
      this._incidents()[0]?.userId ?? ''
    ));
  }

  escalateIncident(incidentId: string, reason: string): void {
    this.escalateUseCase.execute(incidentId, reason);
    this._incidents.update(list =>
      list.map(i => i.id === incidentId
        ? (this.repo.findById(incidentId) ?? i)
        : i)
    );
  }

  // Escucha WaterLeakDetected de ConsumptionMonitoring → abre incidente automático
  private registerEventListeners(userId: string): void {
    this.eventBus.subscribe<WaterLeakDetected>('WaterLeakDetected', event => {
      if (event.userId !== userId) return;

      const incident = this.openUseCase.execute({
        alertId: `leak-${event.deviceId}-${Date.now()}`,
        userId: event.userId,
        deviceId: event.deviceId,
        title: 'Posible fuga detectada',
        message: `${event.deviceName} (${event.location}) registra flujo residual de ${event.flowRateLPM} L/min.`,
        severity: IncidentSeverity.HIGH,
        estimatedLossLiters: event.estimatedHourlyLossLiters
      });
      this._incidents.update(list => [...list, incident]);
    });

    this.eventBus.subscribe<AnomalousConsumptionDetected>('AnomalousConsumptionDetected', event => {
      if (event.userId !== userId) return;

      const incident = this.openUseCase.execute({
        alertId: `anomaly-${event.deviceId}-${Date.now()}`,
        userId: event.userId,
        deviceId: event.deviceId,
        title: 'Consumo anómalo detectado',
        message: `Pico de ${event.spikeVolumeLiters}L detectado. Promedio: ${event.averageVolumeLiters}L.`,
        severity: event.severity as IncidentSeverity,
        estimatedLossLiters: event.spikeVolumeLiters - event.averageVolumeLiters
      });
      this._incidents.update(list => [...list, incident]);
    });
  }
}
