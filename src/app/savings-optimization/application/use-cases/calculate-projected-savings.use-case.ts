/**
 * Savings Optimization — CalculateProjectedSavingsUseCase
 *
 * Pertenece a: savings-optimization/application/use-cases
 * Proyecta el consumo al final del período y determina si la meta es alcanzable.
 */
import { Injectable, inject } from '@angular/core';
import { SavingGoalRepository } from '../../domain/repositories/saving-goal.repository';

export interface ProjectionDto {
  projectedVolumeLiters: number;
  targetVolumeLiters: number;
  isOnTrack: boolean;
  daysRemaining: number;
  progressPercent: number;
}

@Injectable()
export class CalculateProjectedSavingsUseCase {
  private readonly repo = inject(SavingGoalRepository);

  execute(userId: string): ProjectionDto | null {
    const goal = this.repo.findActiveByUserId(userId);
    if (!goal) return null;

    const projected = goal.calculateProjectedSavings();
    return {
      projectedVolumeLiters: projected.liters,
      targetVolumeLiters: goal.savingTarget.targetVolume.liters,
      isOnTrack: goal.savingTarget.isAchievedBy(projected),
      daysRemaining: goal.daysRemaining,
      progressPercent: goal.progressPercent
    };
  }
}
