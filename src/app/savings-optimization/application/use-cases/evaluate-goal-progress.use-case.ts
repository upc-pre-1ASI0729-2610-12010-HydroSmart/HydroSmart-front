/**
 * Savings Optimization — EvaluateGoalProgressUseCase
 *
 * Pertenece a: savings-optimization/application/use-cases
 * Actualiza el volumen de consumo actual en la meta y delega al aggregate
 * la evaluación del progreso. Publica los domain events resultantes.
 */
import { Injectable, inject } from '@angular/core';
import { SavingGoalRepository } from '../../domain/repositories/saving-goal.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

@Injectable()
export class EvaluateGoalProgressUseCase {
  private readonly repo = inject(SavingGoalRepository);
  private readonly eventBus = inject(DomainEventBus);

  execute(userId: string, currentVolumeLiters: number): 'on_track' | 'at_risk' | 'completed' | 'failed' | null {
    const goal = this.repo.findActiveByUserId(userId);
    if (!goal) return null;

    const result = goal.evaluateGoalProgress(WaterVolume.ofLiters(currentVolumeLiters));

    this.repo.save(goal);
    this.eventBus.dispatchFromAggregate(goal);

    return result;
  }
}
