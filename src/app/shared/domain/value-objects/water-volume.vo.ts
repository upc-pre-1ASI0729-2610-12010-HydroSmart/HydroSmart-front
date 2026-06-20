/**
 * Shared Kernel — WaterVolume Value Object
 *
 * Pertenece a: shared/domain/value-objects
 * Por qué aquí: WaterVolume es un concepto reutilizable en múltiples contextos
 * (ConsumptionMonitoring, IncidentDetection, SavingsOptimization, RentalManagement).
 * Al vivir en el Shared Kernel, todos los bounded contexts usan el mismo lenguaje
 * para hablar de volúmenes de agua — sin duplicar lógica de conversión.
 *
 * Invariante: el volumen no puede ser negativo.
 */
import { ValueObject } from '../base/value-object.base';

interface WaterVolumeProps {
  value: number;
  unit: 'liters' | 'm3';
}

export class WaterVolume extends ValueObject<WaterVolumeProps> {
  private constructor(props: WaterVolumeProps) {
    super(props);
  }

  static ofLiters(value: number): WaterVolume {
    if (value < 0) throw new Error(`WaterVolume no puede ser negativo: ${value}`);
    return new WaterVolume({ value, unit: 'liters' });
  }

  static ofM3(value: number): WaterVolume {
    if (value < 0) throw new Error(`WaterVolume no puede ser negativo: ${value}`);
    return new WaterVolume({ value, unit: 'm3' });
  }

  static zero(): WaterVolume {
    return new WaterVolume({ value: 0, unit: 'liters' });
  }

  get liters(): number {
    return this.props.unit === 'liters' ? this.props.value : this.props.value * 1000;
  }

  get m3(): number {
    return this.props.unit === 'm3' ? this.props.value : this.props.value / 1000;
  }

  isGreaterThan(other: WaterVolume): boolean {
    return this.liters > other.liters;
  }

  isLessThan(other: WaterVolume): boolean {
    return this.liters < other.liters;
  }

  isZero(): boolean {
    return this.liters === 0;
  }

  add(other: WaterVolume): WaterVolume {
    return WaterVolume.ofLiters(this.liters + other.liters);
  }

  subtract(other: WaterVolume): WaterVolume {
    return WaterVolume.ofLiters(Math.max(0, this.liters - other.liters));
  }

  multiplyBy(factor: number): WaterVolume {
    return WaterVolume.ofLiters(this.liters * factor);
  }

  percentageOf(total: WaterVolume): number {
    if (total.liters === 0) return 0;
    return (this.liters / total.liters) * 100;
  }

  displayLiters(): string {
    return `${this.liters.toLocaleString('es-PE')} L`;
  }
}
