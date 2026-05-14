/**
 * Savings Optimization — MonthlyBudget Value Object
 *
 * Pertenece a: savings-optimization/domain/value-objects
 * Por qué domain: el presupuesto mensual es un concepto clave del dominio de ahorro.
 * Tiene comportamiento propio: sabe si fue excedido, cuánto queda, qué porcentaje
 * se ahorró. No es solo un número — tiene semántica del negocio.
 */
import { ValueObject } from '../../../shared/domain/base/value-object.base';

interface MonthlyBudgetProps {
  amount: number;
  currency: string;
}

export class MonthlyBudget extends ValueObject<MonthlyBudgetProps> {
  private constructor(props: MonthlyBudgetProps) {
    super(props);
    if (props.amount <= 0) throw new Error('El presupuesto mensual debe ser positivo');
  }

  static of(amount: number, currency = 'PEN'): MonthlyBudget {
    return new MonthlyBudget({ amount, currency });
  }

  get amount(): number { return this.props.amount; }
  get currency(): string { return this.props.currency; }

  isExceededBy(actualSpend: number): boolean {
    return actualSpend > this.props.amount;
  }

  remainingAfter(actualSpend: number): number {
    return Math.max(0, this.props.amount - actualSpend);
  }

  savingsPercent(actualSpend: number): number {
    if (actualSpend >= this.props.amount) return 0;
    return ((this.props.amount - actualSpend) / this.props.amount) * 100;
  }

  display(): string {
    return `${this.props.currency} ${this.props.amount.toFixed(2)}`;
  }
}
