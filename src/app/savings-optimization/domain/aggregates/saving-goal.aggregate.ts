/**
 * Savings Optimization — SavingGoal Aggregate Root
 *
 * Pertenece a: savings-optimization/domain/aggregates
 * Por qué domain: contiene toda la lógica del negocio de ahorro.
 * Protege invariantes: una meta completada no puede recalcularse,
 * las recomendaciones emergen del análisis de categorías de consumo.
 *
 * Comportamientos del negocio:
 *   - evaluateGoalProgress(): calcula si la meta está en riesgo o alcanzada
 *   - adjustConsumptionRecommendation(): genera recomendaciones personalizadas
 *   - calculateProjectedSavings(): proyecta el ahorro al ritmo actual
 */
import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';
import { TimestampRange } from '../../../shared/domain/value-objects/timestamp-range.vo';
import { SavingTarget } from '../value-objects/saving-target.vo';
import { MonthlyBudget } from '../value-objects/monthly-budget.vo';
import { ConsumptionLimit } from '../value-objects/consumption-limit.vo';
import { SavingGoalCompleted } from '../events/saving-goal-completed.event';
import { SavingGoalAtRisk } from '../events/saving-goal-at-risk.event';

export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused';

export interface CategoryUsage {
  category: string;
  percentage: number;
}

export class SavingGoal extends AggregateRoot {
  private _currentVolume: WaterVolume;
  private _status: GoalStatus;
  private _recommendations: string[];

  constructor(
    id: string,
    public readonly userId: string,
    public readonly name: string,
    private readonly target: SavingTarget,
    private readonly budget: MonthlyBudget,
    private readonly limit: ConsumptionLimit,
    public readonly period: TimestampRange,
    currentVolume: WaterVolume,
    status: GoalStatus,
    recommendations: string[]
  ) {
    super(id);
    this._currentVolume = currentVolume;
    this._status = status;
    this._recommendations = [...recommendations];
  }

  get currentVolume(): WaterVolume { return this._currentVolume; }
  get status(): GoalStatus { return this._status; }
  get recommendations(): string[] { return [...this._recommendations]; }
  get monthlyBudget(): MonthlyBudget { return this.budget; }
  get savingTarget(): SavingTarget { return this.target; }
  get consumptionLimit(): ConsumptionLimit { return this.limit; }

  get progressPercent(): number {
    return this.target.progressPercent(this._currentVolume);
  }

  get isAchieved(): boolean {
    return this.target.isAchievedBy(this._currentVolume);
  }

  get daysRemaining(): number {
    return this.period.remainingDays();
  }

  /**
   * Comportamiento principal: evalúa el progreso real de la meta.
   * Si está completada → emite SavingGoalCompleted.
   * Si está en riesgo → emite SavingGoalAtRisk.
   * Las reglas las decide este aggregate, no el service.
   */
  evaluateGoalProgress(newVolume: WaterVolume): 'on_track' | 'at_risk' | 'completed' | 'failed' {
    this._currentVolume = newVolume;

    if (this.isAchieved && this._status === 'active') {
      this._status = 'completed';
      this.addDomainEvent(new SavingGoalCompleted(
        this.id, this.userId,
        this.target.targetVolume.liters,
        this._currentVolume.liters,
        this.target.savedVolume(this._currentVolume).liters
      ));
      return 'completed';
    }

    const projected = this.calculateProjectedSavings();
    if (!this.target.isAchievedBy(projected) && this.daysRemaining > 0) {
      this.addDomainEvent(new SavingGoalAtRisk(
        this.id, this.userId,
        projected.liters,
        this.target.targetVolume.liters,
        this.daysRemaining
      ));
      return 'at_risk';
    }

    if (this.daysRemaining === 0 && !this.isAchieved) {
      this._status = 'failed';
      return 'failed';
    }

    return 'on_track';
  }

  /**
   * Comportamiento: proyecta el consumo al final del período al ritmo actual.
   */
  calculateProjectedSavings(): WaterVolume {
    const daysElapsed = this.period.durationDays - this.daysRemaining;
    if (daysElapsed <= 0) return this._currentVolume;

    const dailyRate = this._currentVolume.liters / daysElapsed;
    const projectedTotal = dailyRate * this.period.durationDays;
    return WaterVolume.ofLiters(projectedTotal);
  }

  /**
   * Comportamiento: genera recomendaciones personalizadas basadas en el
   * desglose de categorías de consumo. La lógica de recomendación
   * vive en el aggregate, no en el service.
   */
  adjustConsumptionRecommendation(categories: CategoryUsage[]): string[] {
    const recs: string[] = [];

    const bathroom = categories.find(c => c.category === 'bathroom');
    const garden = categories.find(c => c.category === 'garden');
    const kitchen = categories.find(c => c.category === 'kitchen');
    const laundry = categories.find(c => c.category === 'laundry');

    if ((bathroom?.percentage ?? 0) > 35) {
      recs.push('Reducir la ducha en 2 min ahorra hasta 20L/día. Meta factible.');
    }
    if ((garden?.percentage ?? 0) > 18) {
      recs.push('Regar de noche reduce evaporación hasta 30%. Cambia el horario.');
    }
    if ((kitchen?.percentage ?? 0) > 28) {
      recs.push('Lavar platos con agua fría y reutilizar agua de cocción.');
    }
    if ((laundry?.percentage ?? 0) > 12) {
      recs.push('Usar la lavadora con carga completa reduce ciclos y agua.');
    }
    if (recs.length === 0) {
      recs.push('¡Excelente! Tus hábitos de consumo están bien distribuidos.');
    }

    this._recommendations = recs;
    return recs;
  }

  pause(): void {
    if (this._status === 'active') this._status = 'paused';
  }

  resume(): void {
    if (this._status === 'paused') this._status = 'active';
  }
}
