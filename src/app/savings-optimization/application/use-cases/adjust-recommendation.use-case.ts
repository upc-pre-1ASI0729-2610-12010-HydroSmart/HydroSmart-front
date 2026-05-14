/**
 * Savings Optimization — AdjustRecommendationUseCase
 *
 * Pertenece a: savings-optimization/application/use-cases
 * Delega al aggregate SavingGoal la generación de recomendaciones
 * personalizadas basadas en el desglose de categorías de consumo.
 */
import { Injectable, inject } from '@angular/core';
import { SavingGoalRepository } from '../../domain/repositories/saving-goal.repository';
import { CategoryUsage } from '../../domain/aggregates/saving-goal.aggregate';

@Injectable()
export class AdjustRecommendationUseCase {
  private readonly repo = inject(SavingGoalRepository);

  execute(userId: string, categories: CategoryUsage[]): string[] {
    const goal = this.repo.findActiveByUserId(userId);
    if (!goal) return [];

    const recs = goal.adjustConsumptionRecommendation(categories);
    this.repo.save(goal);
    return recs;
  }
}
