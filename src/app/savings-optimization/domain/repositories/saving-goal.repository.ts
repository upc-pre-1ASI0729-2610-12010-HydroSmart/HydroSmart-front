/**
 * Savings Optimization — SavingGoal Repository (abstract)
 *
 * Pertenece a: savings-optimization/domain/repositories
 */
import { SavingGoal } from '../aggregates/saving-goal.aggregate';

export abstract class SavingGoalRepository {
  abstract findActiveByUserId(userId: string): SavingGoal | null;
  abstract findAllByUserId(userId: string): SavingGoal[];
  abstract save(goal: SavingGoal): void;
}
