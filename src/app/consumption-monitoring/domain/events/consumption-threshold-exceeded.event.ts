/**
 * Consumption Monitoring — ConsumptionThresholdExceeded Domain Event
 *
 * Pertenece a: consumption-monitoring/domain/events
 * Emitido cuando el consumo mensual supera el límite establecido.
 * SavingsOptimization puede escuchar este evento para recalcular metas.
 */
import { DomainEvent } from '../../../shared/domain/base/domain-event.base';

export class ConsumptionThresholdExceeded extends DomainEvent {
  readonly eventType = 'ConsumptionThresholdExceeded';

  constructor(
    public readonly userId: string,
    public readonly currentVolumeLiters: number,
    public readonly thresholdVolumeLiters: number,
    public readonly exceededBy: number
  ) {
    super();
  }

  get exceedancePercent(): number {
    return ((this.currentVolumeLiters - this.thresholdVolumeLiters) / this.thresholdVolumeLiters) * 100;
  }
}
