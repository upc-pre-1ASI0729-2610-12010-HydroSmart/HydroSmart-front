import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { ConsumptionSession, ConsumptionReport } from '../../domain/aggregates/consumption-session.aggregate';
import { IoTSensor, SensorStatus, SensorType, SensorMonitoringPreferences } from '../../domain/entities/iot-sensor.entity';
import { ConsumptionReading } from '../../domain/entities/consumption-reading.entity';
import { ConsumptionPattern } from '../../domain/entities/consumption-pattern.entity';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';
import { TimestampRange } from '../../../shared/domain/value-objects/timestamp-range.vo';
import { ApiResponse } from '../../../shared/infrastructure/http/api-response.model';
import { environment } from '../../../../environments/environment';

interface ConsumptionSummaryDTO {
  totalVolumeLiters: number;
  variationPercent: number;
  estimatedCostPEN: number;
  currentDayVolumeLiters: number;
  averageDailyVolumeLiters: number;
  categoryBreakdown: { category: string; volumeLiters: number; percentage: number }[];
  dailyLabels: string[];
  dailyValues: number[];
  isDecreasing: boolean;
}

interface SensorDTO {
  id: number;
  name: string;
  type: string;
  location: string;
  status: string;
  currentFlowLPM: number;
  totalConsumptionLiters: number;
  lastActiveAt: string;
  unitId: string;
  unitIdNumeric: number;
  unitNumber: string;
  preferences: SensorMonitoringPreferences;
  unresolvedAlertCount: number;
}

interface ReportDTO {
  totalVolume: number;
  averageDailyVolume: number;
  peakDay: string;
  estimatedCost: number;
  deviceRanking: { sensorId: number; sensorName: string; volume: number; percentage: number; rank: number }[];
  weeklyAverages: { week: string; average: number }[];
}

@Injectable()
export class HttpConsumptionSessionRepository extends ConsumptionSessionRepository {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private _sessionCache = signal<ConsumptionSession | null>(null);
  private _sensorsCache = signal<IoTSensor[]>([]);
  private _reportCache = signal<ConsumptionReport | null>(null);

  async preloadForBuilding(buildingId: string): Promise<void> {
    const numId = this.numericId(buildingId);
    await Promise.all([
      this.loadSummary(`${this.api}/buildings/${numId}/summary`, `building-${numId}`),
      this.loadSensors(`${this.api}/sensors?buildingId=${numId}`),
      this.loadReport(numId, new Date().toISOString().slice(0, 7)),
    ]);
  }

  async preloadForUnit(unitId: string, buildingId?: string): Promise<void> {
    const numId = this.numericId(unitId);
    await Promise.all([
      this.loadSummary(`${this.api}/units/${numId}/summary`, `unit-${numId}`),
      this.loadSensors(`${this.api}/sensors?unitId=${numId}`),
    ]);
    if (buildingId) {
      await this.loadReport(this.numericId(buildingId), new Date().toISOString().slice(0, 7));
    }
  }

  findCurrentByUserId(_userId: string): ConsumptionSession | null {
    return this._sessionCache();
  }

  findAllSensors(_userId: string): IoTSensor[] {
    return this._sensorsCache();
  }

  findSensorsByUnitId(unitId: string): IoTSensor[] {
    if (!unitId) return this._sensorsCache();
    const numId = this.numericId(unitId);
    return this._sensorsCache().filter((s) => {
      const sNumericId = (s as any).unitIdNumeric;
      const sStringId = s.unitId;
      // Comparar contra cualquiera de los dos formatos
      return (
        sNumericId === numId ||
        String(sNumericId) === String(numId) ||
        sStringId === unitId ||
        sStringId === `unit-${String(numId).padStart(3, '0')}`
      );
    });
  }

  addSensor(sensor: IoTSensor): void {
    this._sensorsCache.set([...this._sensorsCache(), sensor]);
  }

  findReport(_userId: string): ConsumptionReport | null {
    return this._reportCache();
  }

  saveSensorPreferences(sensor: IoTSensor): void {
    firstValueFrom(
      this.http.put<ApiResponse<SensorDTO>>(
        `${this.api}/sensors/${sensor.id}/preferences`,
        sensor.preferences,
      ),
    ).catch((err) => console.error('Error saving sensor preferences:', err));

    const idx = this._sensorsCache().findIndex((s) => s.id === sensor.id);
    if (idx >= 0) {
      const updated = [...this._sensorsCache()];
      updated[idx] = sensor;
      this._sensorsCache.set(updated);
    }
  }

  private async loadSummary(url: string, sessionId: string): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<ConsumptionSummaryDTO>>(url));
      if (res.success && res.data) {
        this._sessionCache.set(this.mapToSession(res.data, sessionId));
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }

  private async loadSensors(url: string): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<SensorDTO[]>>(url));
      if (res.success && res.data) {
        this._sensorsCache.set(res.data.map((dto) => this.mapToSensor(dto)));
      }
    } catch (err) {
      console.error('Error loading sensors:', err);
    }
  }

  private async loadReport(buildingId: number, period: string): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<ReportDTO>>(
          `${this.api}/reports/monthly?buildingId=${buildingId}&period=${period}`,
        ),
      );
      if (res.success && res.data) {
        this._reportCache.set(this.mapToReport(res.data));
      }
    } catch (err) {
      console.error('Error loading report:', err);
    }
  }

  private mapToSession(dto: ConsumptionSummaryDTO, sessionId: string): ConsumptionSession {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const readings: ConsumptionReading[] = dto.dailyValues.map(
      (liters, i) =>
        new ConsumptionReading(
          `reading-${i}`,
          'aggregated',
          WaterVolume.ofLiters(liters),
          new Date(year, month, i + 1),
          'other',
        ),
    );

    const prevTotal =
      dto.variationPercent !== 0
        ? dto.totalVolumeLiters / (1 + dto.variationPercent / 100)
        : dto.totalVolumeLiters;

    const pattern = new ConsumptionPattern(
      `pattern-${sessionId}`,
      sessionId,
      WaterVolume.ofLiters(dto.averageDailyVolumeLiters),
      WaterVolume.ofLiters(prevTotal),
      7,
      1,
    );

    return ConsumptionSession.create({
      id: sessionId,
      userId: sessionId,
      period: TimestampRange.currentMonth(),
      readings,
      pattern,
      totalVolume: WaterVolume.ofLiters(dto.totalVolumeLiters),
      previousPeriodVolume: WaterVolume.ofLiters(prevTotal),
      estimatedCostPEN: dto.estimatedCostPEN,
      categoryBreakdown: dto.categoryBreakdown,
      currentDayVolumeLiters: dto.currentDayVolumeLiters,
    });
  }

  private mapToSensor = (dto: SensorDTO): IoTSensor => {
    const sensor = new IoTSensor(
      String(dto.id),
      'building-admin',
      dto.unitId,
      dto.name,
      dto.type as any,
      dto.location,
      dto.status as any,
      new Date(dto.lastActiveAt),
      new Date(),
      dto.currentFlowLPM,
      dto.totalConsumptionLiters,
      dto.preferences,
      [],
    );
    // Adjuntar el ID numérico para que el filtrado funcione
    (sensor as any).unitIdNumeric = dto.unitIdNumeric;
    return sensor;
  };

  private mapToReport(dto: ReportDTO): ConsumptionReport {
    const today = new Date();
    return {
      id: `report-${today.toISOString().slice(0, 7)}`,
      userId: 'current',
      period: 'monthly',
      startDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
      endDate: today.toISOString().slice(0, 10),
      totalVolumeLiters: dto.totalVolume,
      averageDailyVolumeLiters: dto.averageDailyVolume,
      peakDay: dto.peakDay,
      deviceRanking: dto.deviceRanking.map((d) => ({
        deviceId: String(d.sensorId),
        deviceName: d.sensorName,
        volumeLiters: d.volume,
        percentage: d.percentage,
        rank: d.rank,
      })),
      weeklyAverages: dto.weeklyAverages.map((w) => ({
        week: w.week,
        averageLiters: w.average,
      })),
      generatedAt: new Date().toISOString(),
      estimatedCostPEN: dto.estimatedCost,
    };
  }

  private numericId(id: string): number {
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : parseInt(id, 10) || 1;
  }
}
