/**
 * Savings Optimization — SavingGoalAtRisk Domain Event
 *
 * Emitido cuando el ritmo de consumo proyecta que la meta no se alcanzará.
 * IncidentDetection o Notifications pueden reaccionar con alertas preventivas.
 */
import { DomainEvent } from '../../../shared/domain/base/domain-event.base';

export class SavingGoalAtRisk extends DomainEvent {
  readonly eventType = 'SavingGoalAtRisk';

  constructor(
    public readonly goalId: string,
    public readonly userId: string,
    public readonly projectedVolumeLiters: number,
    public readonly targetVolumeLiters: number,
    public readonly daysRemaining: number
  ) {
    super();
  }

  get projectedExcessLiters(): number {
    return Math.max(0, this.projectedVolumeLiters - this.targetVolumeLiters);
  }
}
