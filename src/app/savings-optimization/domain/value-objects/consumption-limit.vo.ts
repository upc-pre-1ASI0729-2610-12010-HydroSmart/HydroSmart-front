/**
 * Savings Optimization — ConsumptionLimit Value Object
 *
 * Pertenece a: savings-optimization/domain/value-objects
 * El límite de consumo permitido. Diferente de SavingTarget: el límite
 * es una restricción (no superar), mientras que la meta es una aspiración.
 */
import { ValueObject } from '../../../shared/domain/base/value-object.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

interface ConsumptionLimitProps {
  maxLiters: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export class ConsumptionLimit extends ValueObject<ConsumptionLimitProps> {
  private constructor(props: ConsumptionLimitProps) {
    super(props);
  }

  static monthly(maxLiters: number): ConsumptionLimit {
    return new ConsumptionLimit({ maxLiters, period: 'monthly' });
  }

  get maxVolume(): WaterVolume { return WaterVolume.ofLiters(this.props.maxLiters); }
  get period(): string { return this.props.period; }

  isViolatedBy(actual: WaterVolume): boolean {
    return actual.isGreaterThan(this.maxVolume);
  }

  violationAmount(actual: WaterVolume): WaterVolume {
    if (!this.isViolatedBy(actual)) return WaterVolume.zero();
    return actual.subtract(this.maxVolume);
  }
}
