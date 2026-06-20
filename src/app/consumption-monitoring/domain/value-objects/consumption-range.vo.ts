/**
 * Consumption Monitoring — ConsumptionRange Value Object
 *
 * Pertenece a: consumption-monitoring/domain/value-objects
 * Por qué domain: el rango válido de consumo es un concepto del dominio
 * de monitoreo. Encapsula la lógica de verificar si un volumen cae dentro
 * de rangos esperados. Pertenece a este contexto (no al shared kernel)
 * porque es específico de la semántica de consumo normal.
 */
import { ValueObject } from '../../../shared/domain/base/value-object.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

interface ConsumptionRangeProps {
  minLiters: number;
  maxLiters: number;
}

export class ConsumptionRange extends ValueObject<ConsumptionRangeProps> {
  private constructor(props: ConsumptionRangeProps) {
    super(props);
    if (props.minLiters > props.maxLiters) {
      throw new Error('El mínimo no puede superar el máximo en ConsumptionRange');
    }
  }

  static of(min: WaterVolume, max: WaterVolume): ConsumptionRange {
    return new ConsumptionRange({
      minLiters: min.liters,
      maxLiters: max.liters
    });
  }

  static daily(minLiters: number, maxLiters: number): ConsumptionRange {
    return new ConsumptionRange({ minLiters, maxLiters });
  }

  get min(): WaterVolume { return WaterVolume.ofLiters(this.props.minLiters); }
  get max(): WaterVolume { return WaterVolume.ofLiters(this.props.maxLiters); }

  contains(volume: WaterVolume): boolean {
    return volume.liters >= this.props.minLiters && volume.liters <= this.props.maxLiters;
  }

  isExceededBy(volume: WaterVolume): boolean {
    return volume.liters > this.props.maxLiters;
  }

  isBelowMinimum(volume: WaterVolume): boolean {
    return volume.liters < this.props.minLiters;
  }

  // Devuelve qué tan fuera del rango está el volumen (0 = dentro, >1 = muy fuera)
  exceedanceFactor(volume: WaterVolume): number {
    if (this.contains(volume)) return 0;
    if (this.isExceededBy(volume)) {
      return (volume.liters - this.props.maxLiters) / this.props.maxLiters;
    }
    return (this.props.minLiters - volume.liters) / this.props.minLiters;
  }
}
