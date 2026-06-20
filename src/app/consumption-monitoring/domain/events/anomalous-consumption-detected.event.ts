/**
 * Consumption Monitoring — AnomalousConsumptionDetected Domain Event
 *
 * Pertenece a: consumption-monitoring/domain/events
 * Por qué domain: es un hecho del negocio que ocurrió en este contexto.
 * Este evento desacopla ConsumptionMonitoring de IncidentDetection:
 * Monitoring detecta → emite evento → Incident Detection reacciona.
 */
import { DomainEvent } from '../../../shared/domain/base/domain-event.base';

export class AnomalousConsumptionDetected extends DomainEvent {
  readonly eventType = 'AnomalousConsumptionDetected';

  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly spikeVolumeLiters: number,
    public readonly averageVolumeLiters: number,
    public readonly severity: 'low' | 'medium' | 'high' | 'critical',
    public readonly detectedAt: string
  ) {
    super();
  }
}
