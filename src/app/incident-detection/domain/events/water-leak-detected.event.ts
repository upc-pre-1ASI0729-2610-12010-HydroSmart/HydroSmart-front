import { DomainEvent } from '../../../shared/domain/base/domain-event.base';

export class WaterLeakDetected extends DomainEvent {
  readonly eventType = 'WaterLeakDetected';

  constructor(
    public readonly deviceId: string,
    public readonly deviceName: string,
    public readonly location: string,
    public readonly flowRateLPM: number,
    public readonly userId: string
  ) {
    super();
  }

  get estimatedHourlyLossLiters(): number {
    return this.flowRateLPM * 60;
  }
}
