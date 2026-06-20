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

  get penaltyPerExcessLiter(): number {
    return this.props.penaltyPerExcessLiter;
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
