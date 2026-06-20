/**
 * Savings Optimization — MockSavingGoalRepository
 *
 * Pertenece a: savings-optimization/infrastructure/repositories
 * Hidrata los aggregates SavingGoal desde JSON. Simula persistencia en memoria.
 */
import { Injectable } from '@angular/core';
import { SavingGoalRepository } from '../../domain/repositories/saving-goal.repository';
import { SavingGoal } from '../../domain/aggregates/saving-goal.aggregate';
import { SavingTarget } from '../../domain/value-objects/saving-target.vo';
import { MonthlyBudget } from '../../domain/value-objects/monthly-budget.vo';
import { ConsumptionLimit } from '../../domain/value-objects/consumption-limit.vo';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';
import { TimestampRange } from '../../../shared/domain/value-objects/timestamp-range.vo';
import goalsJson from '../mock-data/saving-goals.json';

@Injectable()
export class MockSavingGoalRepository extends SavingGoalRepository {
  private goals: SavingGoal[] = this.hydrateGoals();

  findActiveByUserId(userId: string): SavingGoal | null {
    return this.goals.find(g => g.userId === userId && g.status === 'active') ?? null;
  }

  findAllByUserId(userId: string): SavingGoal[] {
    return this.goals.filter(g => g.userId === userId);
  }

  save(goal: SavingGoal): void {
    const idx = this.goals.findIndex(g => g.id === goal.id);
    if (idx >= 0) {
      this.goals[idx] = goal;
    } else {
      this.goals.push(goal);
    }
  }

  private hydrateGoals(): SavingGoal[] {
    return (goalsJson as any[]).map(raw => {
      const period = TimestampRange.of(
        new Date(raw.startDate),
        new Date(raw.endDate)
      );

      return new SavingGoal(
        raw.id,
        raw.userId,
        raw.name,
        SavingTarget.monthly(raw.targetVolume),
        MonthlyBudget.of(raw.budget.amount, raw.budget.currency),
        ConsumptionLimit.monthly(raw.targetVolume * 1.2),
        period,
        WaterVolume.ofLiters(raw.currentVolume),
        raw.status,
        raw.recommendations ?? []
      );
    });
  }
}
