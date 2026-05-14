/**
 * Savings Optimization — SavingsOptimizationService (Application Service)
 *
 * Pertenece a: savings-optimization/application/services
 * Facade reactivo para la presentación del módulo de ahorro.
 * Los components inyectan este servicio, no los use cases directamente.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { SavingGoalRepository } from '../../domain/repositories/saving-goal.repository';
import { EvaluateGoalProgressUseCase } from '../use-cases/evaluate-goal-progress.use-case';
import { AdjustRecommendationUseCase } from '../use-cases/adjust-recommendation.use-case';
import { CalculateProjectedSavingsUseCase, ProjectionDto } from '../use-cases/calculate-projected-savings.use-case';
import { SavingGoal } from '../../domain/aggregates/saving-goal.aggregate';
import { CategoryUsage } from '../../domain/aggregates/saving-goal.aggregate';

@Injectable()
export class SavingsOptimizationService {
  private readonly repo = inject(SavingGoalRepository);
  private readonly evaluateUseCase = inject(EvaluateGoalProgressUseCase);
  private readonly recommendUseCase = inject(AdjustRecommendationUseCase);
  private readonly projectionUseCase = inject(CalculateProjectedSavingsUseCase);

  private _userId = '';
  private _activeGoal = signal<SavingGoal | null>(null);
  private _projection = signal<ProjectionDto | null>(null);

  readonly activeGoal = this._activeGoal.asReadonly();
  readonly projection = this._projection.asReadonly();

  readonly goalStatus = computed(() => {
    const goal = this._activeGoal();
    if (!goal) return null;
    return goal.status;
  });

  readonly recommendations = computed(() =>
    this._activeGoal()?.recommendations ?? []
  );

  initialize(userId: string): void {
    this._userId = userId;
    this.refresh();
  }

  refresh(): void {
    this._activeGoal.set(this.repo.findActiveByUserId(this._userId));
    this._projection.set(this.projectionUseCase.execute(this._userId));
  }

  evaluateWithCurrentConsumption(currentVolumeLiters: number): void {
    this.evaluateUseCase.execute(this._userId, currentVolumeLiters);
    this.refresh();
  }

  refreshRecommendations(categories: CategoryUsage[]): string[] {
    const recs = this.recommendUseCase.execute(this._userId, categories);
    this._activeGoal.set(this.repo.findActiveByUserId(this._userId));
    return recs;
  }
}
