/**
 * Savings Optimization — SavingTarget Value Object
 *
 * Pertenece a: savings-optimization/domain/value-objects
 * El objetivo de ahorro en volumen (litros). Sabe calcular el progreso,
 * el volumen ahorrado y si fue alcanzado. Inmutable.
 */
import { ValueObject } from '../../../shared/domain/base/value-object.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

interface SavingTargetProps {
  targetLiters: number;
  period: 'weekly' | 'monthly' | 'quarterly';
}

export class SavingTarget extends ValueObject<SavingTargetProps> {
  private constructor(props: SavingTargetProps) {
    super(props);
    if (props.targetLiters <= 0) throw new Error('La meta de ahorro debe ser positiva');
  }

  static monthly(targetLiters: number): SavingTarget {
    return new SavingTarget({ targetLiters, period: 'monthly' });
  }

  static of(targetLiters: number, period: 'weekly' | 'monthly' | 'quarterly'): SavingTarget {
    return new SavingTarget({ targetLiters, period });
  }

  get targetVolume(): WaterVolume { return WaterVolume.ofLiters(this.props.targetLiters); }
  get period(): string { return this.props.period; }

  isAchievedBy(actualVolume: WaterVolume): boolean {
    return !actualVolume.isGreaterThan(this.targetVolume);
  }

  progressPercent(actualVolume: WaterVolume): number {
    if (actualVolume.liters <= 0) return 100;
    const ratio = 1 - (actualVolume.liters / this.props.targetLiters);
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }

  savedVolume(actualVolume: WaterVolume): WaterVolume {
    return this.targetVolume.subtract(actualVolume);
  }
}
