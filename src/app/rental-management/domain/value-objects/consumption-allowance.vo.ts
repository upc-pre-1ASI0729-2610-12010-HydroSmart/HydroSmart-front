/**
 * Rental Management — ConsumptionAllowance Value Object
 *
 * Pertenece a: rental-management/domain/value-objects
 * El cupo de consumo permitido por período para un inquilino.
 * Diferente de ConsumptionLimit (de savings): aquí es contractual,
 * definido en el contrato de arrendamiento.
 */
import { ValueObject } from '../../../shared/domain/base/value-object.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

interface ConsumptionAllowanceProps {
  monthlyLimitLiters: number;
  penaltyPerExcessLiter: number;
  currency: string;
}

export class ConsumptionAllowance extends ValueObject<ConsumptionAllowanceProps> {
  private constructor(props: ConsumptionAllowanceProps) {
    super(props);
  }

  static of(monthlyLimitLiters: number, penaltyPerExcessLiter: number, currency = 'PEN'): ConsumptionAllowance {
    return new ConsumptionAllowance({ monthlyLimitLiters, penaltyPerExcessLiter, currency });
  }

  get monthlyLimit(): WaterVolume {
    return WaterVolume.ofLiters(this.props.monthlyLimitLiters);
  }

  isViolatedBy(actual: WaterVolume): boolean {
    return actual.isGreaterThan(this.monthlyLimit);
  }

  calculatePenalty(actual: WaterVolume): number {
    if (!this.isViolatedBy(actual)) return 0;
    const excess = actual.liters - this.props.monthlyLimitLiters;
    return excess * this.props.penaltyPerExcessLiter;
  }

  excessVolume(actual: WaterVolume): WaterVolume {
    return this.monthlyLimit.subtract(actual).multiplyBy(-1);
  }
}
