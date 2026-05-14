/**
 * Consumption Monitoring — ConsumptionMonitoringService (Application Service)
 *
 * Pertenece a: consumption-monitoring/application/services
 * Por qué application: es el punto de entrada para la capa de presentación.
 * Expone signals reactivos con los datos del dominio. Solo orquesta use cases.
 * NO contiene reglas de negocio — esas viven en el aggregate ConsumptionSession.
 *
 * Patrón: Facade para la presentación. Los components inyectan ESTE servicio,
 * no los use cases directamente.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { GetConsumptionSummaryUseCase, ConsumptionSummaryDto } from '../use-cases/get-consumption-summary.use-case';
import { GetConsumptionReportUseCase } from '../use-cases/get-consumption-report.use-case';
import { DetectAnomalyUseCase } from '../use-cases/detect-anomaly.use-case';
import { ManageSensorUseCase } from '../use-cases/manage-sensor.use-case';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { ConsumptionReport } from '../../domain/aggregates/consumption-session.aggregate';
import { IoTSensor, SensorMonitoringPreferences } from '../../domain/entities/iot-sensor.entity';
import { AnomalyResult } from '../../domain/aggregates/consumption-session.aggregate';

@Injectable()
export class ConsumptionMonitoringService {
  private readonly summaryUseCase = inject(GetConsumptionSummaryUseCase);
  private readonly reportUseCase = inject(GetConsumptionReportUseCase);
  private readonly anomalyUseCase = inject(DetectAnomalyUseCase);
  private readonly sensorUseCase = inject(ManageSensorUseCase);
  private readonly repo = inject(ConsumptionSessionRepository);

  private _userId = '';

  // Signals reactivos para la UI
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

  initialize(userId: string): void {
    this._userId = userId;
    this.refresh();
  }

  refresh(): void {
    this._summary.set(this.summaryUseCase.execute(this._userId));
    this._report.set(this.reportUseCase.execute(this._userId));
    this._sensors.set(this.repo.findAllSensors(this._userId));
    this._anomaly.set(this.anomalyUseCase.execute(this._userId));
  }

  updateSensorPreferences(sensorId: string, prefs: Partial<SensorMonitoringPreferences>): void {
    this.sensorUseCase.updatePreferences(this._userId, sensorId, prefs);
    this._sensors.set(this.repo.findAllSensors(this._userId));
  }

  toggleSensor(sensorId: string): void {
    this.sensorUseCase.toggleActivation(this._userId, sensorId);
    this._sensors.set(this.repo.findAllSensors(this._userId));
  }

  runLeakDetection(): void {
    this.sensorUseCase.runLeakDetection(this._userId);
  }
}
