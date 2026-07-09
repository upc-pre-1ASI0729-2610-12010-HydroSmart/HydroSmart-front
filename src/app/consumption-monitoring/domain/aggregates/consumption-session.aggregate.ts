/**
 * Consumption Monitoring — ConsumptionSession Aggregate Root
 *
 * Pertenece a: consumption-monitoring/domain/aggregates
 * Por qué domain: es el Aggregate Root del contexto de monitoreo.
 * Encapsula todas las invariantes del negocio: detección de anomalías,
 * comparación con patrones históricos, verificación de umbrales.
 * Los services solo orquestan — la LÓGICA vive aquí.
 *
 * Invariantes protegidas:
 *   - Un consumo no puede superar 5× el promedio sin generar evento
 *   - El umbral mensual es configurable por usuario
 *   - La variación solo se calcula si hay período anterior
 */
import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';
import { TimestampRange } from '../../../shared/domain/value-objects/timestamp-range.vo';
import { ConsumptionReading } from '../entities/consumption-reading.entity';
import { ConsumptionPattern } from '../entities/consumption-pattern.entity';
import { AnomalousConsumptionDetected } from '../events/anomalous-consumption-detected.event';
import { ConsumptionThresholdExceeded } from '../events/consumption-threshold-exceeded.event';

export interface CategoryBreakdown {
  category: string;
  volumeLiters: number;
  percentage: number;
}

export interface DeviceRankingEntry {
  deviceId: string;
  deviceName: string;
  volumeLiters: number;
  percentage: number;
  rank: number;
}

export interface WeeklyAverage {
  week: string;
  averageLiters: number;
}

export interface ConsumptionReport {
  id: string;
  userId: string;
  period: string;
  startDate: string;
  endDate: string;
  totalVolumeLiters: number;
  averageDailyVolumeLiters: number;
  peakDay: string;
  peakDayVolumeLiters?: number;
  deviceRanking: DeviceRankingEntry[];
  weeklyAverages: WeeklyAverage[];
  generatedAt: string;
  estimatedCostPEN: number;
}

export interface AnomalyResult {
  anomalousReading: ConsumptionReading;
  threshold: WaterVolume;
  averageVolume: WaterVolume;
  severity: 'low' | 'medium' | 'high' | 'critical';
  deviationFactor: number;
}

export class ConsumptionSession extends AggregateRoot {
  private constructor(
    id: string,
    public readonly userId: string,
    public readonly period: TimestampRange,
    private readonly readings: ConsumptionReading[],
    private readonly pattern: ConsumptionPattern,
    private readonly _totalVolume: WaterVolume,
    private readonly _previousPeriodVolume: WaterVolume,
    private readonly _estimatedCostPEN: number,
    private readonly _categoryBreakdown: CategoryBreakdown[],
    private readonly _currentDayVolumeLiters: number
  ) {
    super(id);
  }

  static create(params: {
    id: string;
    userId: string;
    period: TimestampRange;
    readings: ConsumptionReading[];
    pattern: ConsumptionPattern;
    totalVolume: WaterVolume;
    previousPeriodVolume: WaterVolume;
    estimatedCostPEN: number;
    categoryBreakdown: CategoryBreakdown[];
    currentDayVolumeLiters: number;
  }): ConsumptionSession {
    return new ConsumptionSession(
      params.id, params.userId, params.period,
      params.readings, params.pattern,
      params.totalVolume, params.previousPeriodVolume,
      params.estimatedCostPEN, params.categoryBreakdown,
      params.currentDayVolumeLiters
    );
  }

  get totalVolume(): WaterVolume { return this._totalVolume; }
  get previousPeriodVolume(): WaterVolume { return this._previousPeriodVolume; }
  get estimatedCostPEN(): number { return this._estimatedCostPEN; }
  get categoryBreakdown(): CategoryBreakdown[] { return [...this._categoryBreakdown]; }
  get currentDayVolumeLiters(): number { return this._currentDayVolumeLiters; }
  get readingHistory(): ConsumptionReading[] { return [...this.readings]; }

  /**
   * Comportamiento principal: detecta lecturas anómalas comparando contra
   * el patrón histórico del usuario (3× el promedio diario = anomalía).
   * Si encuentra una, registra el DomainEvent AnomalousConsumptionDetected.
   */
  detectAnomaly(): AnomalyResult | null {
    const threshold = this.pattern.buildAnomalyThreshold();
    const avgVolume = this.pattern.averageDailyVolume;

    const anomalousReading = this.readings
      .slice()
      .sort((a, b) => b.volume.liters - a.volume.liters)
      .find(r => r.isAnomalous(threshold));

    if (!anomalousReading) return null;

    const factor = anomalousReading.deviationFactor(avgVolume);
    const severity = factor >= 5 ? 'critical' : factor >= 3 ? 'high' : 'medium';

    this.addDomainEvent(new AnomalousConsumptionDetected(
      this.userId,
      anomalousReading.deviceId,
      anomalousReading.volume.liters,
      avgVolume.liters,
      severity,
      anomalousReading.recordedAt.toISOString()
    ));

    return { anomalousReading, threshold, averageVolume: avgVolume, severity, deviationFactor: factor };
  }

  /**
   * Comportamiento: verifica si el consumo mensual superó un límite dado.
   * Si lo supera, registra el DomainEvent ConsumptionThresholdExceeded.
   */
  exceedThreshold(limit: WaterVolume): boolean {
    const exceeded = this._totalVolume.isGreaterThan(limit);
    if (exceeded) {
      this.addDomainEvent(new ConsumptionThresholdExceeded(
        this.userId,
        this._totalVolume.liters,
        limit.liters,
        this._totalVolume.liters - limit.liters
      ));
    }
    return exceeded;
  }

  /**
   * Comportamiento: calcula la variación porcentual vs el período anterior.
   * Negativo = mejoró (redujo consumo). Positivo = aumentó.
   */
  calculatePeriodVariation(): number {
    return this.pattern.monthlyVariationPercent(this._totalVolume);
  }

  /**
   * Comportamiento: calcula el promedio de consumo de las lecturas del período.
   */
  calculateAverageConsumption(): WaterVolume {
    if (this.readings.length === 0) return WaterVolume.zero();
    const totalLiters = this.readings.reduce((sum, r) => sum + r.volume.liters, 0);
    return WaterVolume.ofLiters(totalLiters / this.readings.length);
  }

  /**
   * Comportamiento: compara cada lectura contra el patrón histórico.
   * Útil para generar el análisis detallado en la vista de reportes.
   */
  compareAgainstHistoricalPattern(): Array<{
    reading: ConsumptionReading;
    classification: 'normal' | 'elevated' | 'anomalous';
    deviation: number;
  }> {
    return this.readings.map(reading => ({
      reading,
      classification: reading.classifyAgainstAverage(this.pattern.averageDailyVolume),
      deviation: reading.volume.liters - this.pattern.averageDailyVolume.liters
    }));
  }

  getDominantCategory(): CategoryBreakdown | null {
    if (this._categoryBreakdown.length === 0) return null;
    return this._categoryBreakdown.reduce((max, cat) =>
      cat.percentage > max.percentage ? cat : max
    );
  }

  getDailyLabels(): string[] {
    return this.readings.map(r => {
      const d = new Date(r.recordedAt);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
  }

  getDailyValues(): number[] {
    return this.readings.map(r => r.volume.liters);
  }
}
