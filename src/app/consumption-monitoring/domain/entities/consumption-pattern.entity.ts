/**
 * Consumption Monitoring — ConsumptionPattern Entity
 *
 * Pertenece a: consumption-monitoring/domain/entities
 * Por qué domain: encapsula el comportamiento de comparación histórica.
 * El patrón histórico del usuario es una entidad porque tiene identidad propia
 * y métodos que expresan conocimiento del dominio: qué es "normal" para este usuario.
 */
import { Entity } from '../../../shared/domain/base/entity.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

export class ConsumptionPattern extends Entity {
  constructor(
    id: string,
    public readonly userId: string,
    public readonly averageDailyVolume: WaterVolume,
    public readonly averageMonthlyVolume: WaterVolume,
    public readonly peakHour: number,
    public readonly peakDayOfWeek: number
  ) {
    super(id);
  }

  // Comportamiento: el patrón construye su propio umbral de anomalía (3× promedio)
  buildAnomalyThreshold(): WaterVolume {
    return this.averageDailyVolume.multiplyBy(3);
  }

  // Comportamiento: el patrón clasifica una lectura según su conocimiento histórico
  classifyReading(volume: WaterVolume): 'normal' | 'elevated' | 'anomalous' {
    const avg = this.averageDailyVolume.liters;
    const v = volume.liters;
    if (v < avg * 1.5) return 'normal';
    if (v < avg * 3.0) return 'elevated';
    return 'anomalous';
  }

  // Comportamiento: calcula variación porcentual contra el promedio mensual
  monthlyVariationPercent(actualVolume: WaterVolume): number {
    const avg = this.averageMonthlyVolume.liters;
    if (avg === 0) return 0;
    return ((actualVolume.liters - avg) / avg) * 100;
  }
}
