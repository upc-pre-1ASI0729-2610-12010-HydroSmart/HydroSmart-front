import { Injectable } from '@angular/core';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { ConsumptionSession } from '../../domain/aggregates/consumption-session.aggregate';
import { ConsumptionReport } from '../../domain/aggregates/consumption-session.aggregate';
import { ConsumptionReading } from '../../domain/entities/consumption-reading.entity';
import { ConsumptionPattern } from '../../domain/entities/consumption-pattern.entity';
import { IoTSensor } from '../../domain/entities/iot-sensor.entity';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';
import { TimestampRange } from '../../../shared/domain/value-objects/timestamp-range.vo';
import consumptionJson from '../mock-data/consumption.json';
import devicesJson from '../mock-data/devices.json';
import reportsJson from '../mock-data/reports.json';

@Injectable()
export class MockConsumptionSessionRepository extends ConsumptionSessionRepository {
  private sensorsCache: IoTSensor[] = this.hydrateSensors();

  findCurrentByUserId(userId: string): ConsumptionSession | null {
    const raw = consumptionJson as any;
    if (raw.userId !== userId) return null;

    const readings: ConsumptionReading[] = raw.dailyReadings.map((r: any, i: number) =>
      new ConsumptionReading(
        `reading-${i}`,
        r.deviceId,
        WaterVolume.ofLiters(r.volume),
        new Date(r.date),
        'other'
      )
    );

    const avgDaily = readings.reduce((s, r) => s + r.volume.liters, 0) / readings.length;

    const pattern = new ConsumptionPattern(
      `pattern-${userId}`,
      userId,
      WaterVolume.ofLiters(avgDaily),
      WaterVolume.ofLiters(raw.previousMonthTotal),
      7,
      1
    );

    return ConsumptionSession.create({
      id: `session-${userId}-${new Date().getMonth()}`,
      userId,
      period: TimestampRange.currentMonth(),
      readings,
      pattern,
      totalVolume: WaterVolume.ofLiters(raw.monthlyTotal),
      previousPeriodVolume: WaterVolume.ofLiters(raw.previousMonthTotal),
      estimatedCostPEN: raw.estimatedCostPEN,
      categoryBreakdown: raw.categoryBreakdown.map((c: any) => ({
        category: c.category,
        volumeLiters: c.volume,
        percentage: c.percentage
      })),
      currentDayVolumeLiters: raw.currentDayVolume
    });
  }

  findAllSensors(userId: string): IoTSensor[] {
    return this.sensorsCache.filter(s => s.userId === userId);
  }

  findSensorsByUnitId(unitId: string): IoTSensor[] {
    return this.sensorsCache.filter(s => s.unitId === unitId);
  }

  addSensor(sensor: IoTSensor): void {
    this.sensorsCache.push(sensor);
  }

  findReport(userId: string): ConsumptionReport | null {
    const raw = reportsJson as any;
    return {
      id: raw.id,
      userId: raw.userId,
      period: raw.period,
      startDate: raw.startDate,
      endDate: raw.endDate,
      totalVolumeLiters: raw.totalVolume,
      averageDailyVolumeLiters: raw.averageDailyVolume,
      peakDay: raw.peakDay,
      deviceRanking: raw.deviceRanking.map((d: any) => ({
        deviceId: d.deviceId,
        deviceName: d.deviceName,
        volumeLiters: d.volume,
        percentage: d.percentage,
        rank: d.rank
      })),
      weeklyAverages: raw.weeklyAverages.map((w: any) => ({
        week: w.week,
        averageLiters: w.average
      })),
      generatedAt: raw.generatedAt,
      estimatedCostPEN: raw.estimatedCost
    };
  }

  saveSensorPreferences(sensor: IoTSensor): void {
    const idx = this.sensorsCache.findIndex(s => s.id === sensor.id);
    if (idx >= 0) this.sensorsCache[idx] = sensor;
  }

  private hydrateSensors(): IoTSensor[] {
    return (devicesJson as any[]).map(raw =>
      new IoTSensor(
        raw.id, raw.userId, raw.unitId ?? null,
        raw.name, raw.type, raw.location,
        raw.status, new Date(raw.lastActiveAt),
        new Date(raw.installationDate),
        raw.currentFlow, raw.totalConsumption,
        raw.preferences, raw.alertHistory ?? []
      )
    );
  }
}
