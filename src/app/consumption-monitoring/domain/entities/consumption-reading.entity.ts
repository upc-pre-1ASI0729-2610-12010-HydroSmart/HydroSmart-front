/**
 * Consumption Monitoring — ConsumptionReading Entity
 *
 * Pertenece a: consumption-monitoring/domain/entities
 * Por qué domain: es una entidad con identidad propia dentro del aggregate
 * ConsumptionSession. Representa una lectura real de un sensor en un instante.
 * Tiene comportamiento: sabe si es anómala respecto a un umbral dado.
 */
import { Entity } from '../../../shared/domain/base/entity.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

export type ConsumptionCategory = 'bathroom' | 'kitchen' | 'garden' | 'laundry' | 'other';

export class ConsumptionReading extends Entity {
  constructor(
    id: string,
    public readonly deviceId: string,
    public readonly volume: WaterVolume,
    public readonly recordedAt: Date,
    public readonly category: ConsumptionCategory
  ) {
    super(id);
  }

  // Comportamiento: la lectura decide si supera un umbral — no el service
  isAnomalous(averageThreshold: WaterVolume): boolean {
    return this.volume.isGreaterThan(averageThreshold);
  }

  // Comportamiento: calcula qué tan elevada es la lectura respecto al promedio
  deviationFactor(average: WaterVolume): number {
    if (average.liters === 0) return 0;
    return this.volume.liters / average.liters;
  }

  classifyAgainstAverage(average: WaterVolume): 'normal' | 'elevated' | 'anomalous' {
    const factor = this.deviationFactor(average);
    if (factor < 1.5) return 'normal';
    if (factor < 3.0) return 'elevated';
    return 'anomalous';
  }
}
