/**
 * Savings Optimization — SavingGoalCompleted Domain Event
 *
 * Emitido cuando el aggregate SavingGoal determina que la meta fue alcanzada.
 * Notification context puede escuchar esto para celebrar el logro al usuario.
 */
import { DomainEvent } from '../../../shared/domain/base/domain-event.base';

export class SavingGoalCompleted extends DomainEvent {
  readonly eventType = 'SavingGoalCompleted';

  constructor(
    public readonly goalId: string,
    public readonly userId: string,
    public readonly targetVolumeLiters: number,
    public readonly achievedVolumeLiters: number,
    public readonly savedLiters: number
  ) {
    super();
  }
}
