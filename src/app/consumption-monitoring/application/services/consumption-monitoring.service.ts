import { Injectable, inject, signal, computed } from '@angular/core';
import { GetConsumptionSummaryUseCase, ConsumptionSummaryDto } from '../use-cases/get-consumption-summary.use-case';
import { GetConsumptionReportUseCase } from '../use-cases/get-consumption-report.use-case';
import { DetectAnomalyUseCase } from '../use-cases/detect-anomaly.use-case';
import { ManageSensorUseCase } from '../use-cases/manage-sensor.use-case';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { ConsumptionReport } from '../../domain/aggregates/consumption-session.aggregate';
import { IoTSensor, SensorMonitoringPreferences, SensorType } from '../../domain/entities/iot-sensor.entity';
import { AnomalyResult } from '../../domain/aggregates/consumption-session.aggregate';

@Injectable()
export class ConsumptionMonitoringService {
  private readonly summaryUseCase = inject(GetConsumptionSummaryUseCase);
  private readonly reportUseCase = inject(GetConsumptionReportUseCase);
  private readonly anomalyUseCase = inject(DetectAnomalyUseCase);
  private readonly sensorUseCase = inject(ManageSensorUseCase);
  private readonly repo = inject(ConsumptionSessionRepository);

  private _userId = '';
  private _unitId: string | null = null;

  private _summary = signal<ConsumptionSummaryDto | null>(null);
  private _report = signal<ConsumptionReport | null>(null);
  private _sensors = signal<IoTSensor[]>([]);
  private _anomaly = signal<AnomalyResult | null>(null);

  readonly summary = this._summary.asReadonly();
  readonly report = this._report.asReadonly();
  readonly sensors = this._sensors.asReadonly();
  readonly anomaly = this._anomaly.asReadonly();

  readonly activeDeviceCount = computed(() =>
    this._sensors().filter(s => s.status === 'active').length
  );

  async initialize(userId: string): Promise<void> {
    this._userId = userId;
    this._unitId = null;
    if ('preloadForBuilding' in (this.repo as any)) {
      await (this.repo as any).preloadForBuilding('1');
    }
    this.refresh();
  }

  async initializeForUnit(adminUserId: string, unitId: string | null, unitConsumptionLiters: number): Promise<void> {
    this._userId = adminUserId;
    this._unitId = unitId;

    if (unitId) {
      // Filtrar por unidad específica
      if ('preloadForUnit' in (this.repo as any)) {
        await (this.repo as any).preloadForUnit(unitId, '1');
      }
    } else {
      // Volver a vista de edificio completo
      if ('preloadForBuilding' in (this.repo as any)) {
        await (this.repo as any).preloadForBuilding('1');
      }
    }

    // Re-leer del cache después del preload (datos reales del backend)
    const httpSummary = this.summaryUseCase.execute(adminUserId);
    if (httpSummary) {
      this._summary.set(httpSummary);
    } else if (unitId) {
      // Fallback sintético si el backend no devolvió datos
      const dailyAvg = Math.round(unitConsumptionLiters / 30);
      const { labels, values } = this.generateDailyData(unitConsumptionLiters, unitId);
      this._summary.set({
        totalVolumeLiters: unitConsumptionLiters,
        variationPercent: -5,
        estimatedCostPEN: unitConsumptionLiters * 0.005,
        currentDayVolumeLiters: dailyAvg,
        averageDailyVolumeLiters: dailyAvg,
        categoryBreakdown: [],
        dailyLabels: labels,
        dailyValues: values,
        isDecreasing: true
      });
    } else {
      this._summary.set(null);
    }

    this._report.set(this.reportUseCase.execute(adminUserId));
    this._sensors.set(
      unitId
        ? this.repo.findSensorsByUnitId(unitId)
        : this.repo.findAllSensors(adminUserId)
    );
    this._anomaly.set(this.anomalyUseCase.execute(adminUserId));
  }

  filterByUnit(unitId: string | null, units?: Array<{ id: string; currentConsumptionLiters: number }>): void {
    if (!unitId) {
      this.refresh();
      return;
    }
    const unit = units?.find(u => u.id === unitId);
    this.initializeForUnit(this._userId, unitId, unit?.currentConsumptionLiters ?? 0);
  }

  refresh(): void {
    if (this._unitId) return;
    this._summary.set(this.summaryUseCase.execute(this._userId));
    this._report.set(this.reportUseCase.execute(this._userId));
    this._sensors.set(this.repo.findAllSensors(this._userId));
    this._anomaly.set(this.anomalyUseCase.execute(this._userId));
  }

  addSensor(sensor: IoTSensor): void {
    this.repo.addSensor(sensor);
    if (this._unitId) {
      this._sensors.set(this.repo.findSensorsByUnitId(this._unitId));
    } else {
      this._sensors.set(this.repo.findAllSensors(this._userId));
    }
  }

  updateSensorPreferences(sensorId: string, prefs: Partial<SensorMonitoringPreferences>): void {
    this.sensorUseCase.updatePreferences(this._userId, sensorId, prefs);
    if (this._unitId) {
      this._sensors.set(this.repo.findSensorsByUnitId(this._unitId));
    } else {
      this._sensors.set(this.repo.findAllSensors(this._userId));
    }
  }

  toggleSensor(sensorId: string): void {
    this.sensorUseCase.toggleActivation(this._userId, sensorId);
    if (this._unitId) {
      this._sensors.set(this.repo.findSensorsByUnitId(this._unitId));
    } else {
      this._sensors.set(this.repo.findAllSensors(this._userId));
    }
  }

  runLeakDetection(): void {
    this.sensorUseCase.runLeakDetection(this._userId);
  }

  private seededRandom(seed: string, index: number): number {
    const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), index * 31);
    return Math.abs(Math.sin(hash) * 0.5 + 0.5);
  }

  private generateDailyData(totalLiters: number, unitId: string): { labels: string[]; values: number[] } {
    const now = new Date();
    const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const month = monthNames[now.getMonth()];
    const labels: string[] = [];
    const rawValues: number[] = [];
    let rawTotal = 0;
    for (let i = 1; i <= 30; i++) {
      const r = this.seededRandom(unitId, i);
      rawValues.push(r);
      rawTotal += r;
    }
    const values: number[] = rawValues.map(v => Math.round((v / rawTotal) * totalLiters));
    for (let i = 1; i <= 30; i++) labels.push(`${i} ${month}`);
    return { labels, values };
  }
}
