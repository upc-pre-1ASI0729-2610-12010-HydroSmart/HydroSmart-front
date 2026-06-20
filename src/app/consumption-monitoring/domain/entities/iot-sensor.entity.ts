import { Entity } from '../../../shared/domain/base/entity.base';

export type SensorStatus = 'active' | 'inactive' | 'warning' | 'error';
export type SensorType = 'smart-meter' | 'flow-sensor' | 'leak-detector' | 'pressure-sensor';

export interface SensorMonitoringPreferences {
  detectLeaks: boolean;
  trackDailyConsumption: boolean;
  trackMonthlyConsumption: boolean;
  sendAlertsOnAnomaly: boolean;
  sendWeeklyReports: boolean;
  sendMonthlyReports: boolean;
  enableEnergyTracking: boolean;
  alertOnHighPressure: boolean;
}

export interface SensorAlertRecord {
  id: string;
  type: 'leak' | 'anomaly' | 'incident' | 'threshold';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export class IoTSensor extends Entity {
  private _status: SensorStatus;
  private _preferences: SensorMonitoringPreferences;
  private _alertHistory: SensorAlertRecord[];
  private _lastActiveAt: Date;

  constructor(
    id: string,
    public readonly userId: string,
    public readonly unitId: string | null,
    public name: string,
    public readonly type: SensorType,
    public readonly location: string,
    status: SensorStatus,
    lastActiveAt: Date,
    public readonly installationDate: Date,
    public readonly currentFlowLPM: number,
    public readonly totalConsumptionLiters: number,
    preferences: SensorMonitoringPreferences,
    alertHistory: SensorAlertRecord[]
  ) {
    super(id);
    this._status = status;
    this._preferences = { ...preferences };
    this._alertHistory = [...alertHistory];
    this._lastActiveAt = lastActiveAt;
  }

  get status(): SensorStatus { return this._status; }
  get preferences(): SensorMonitoringPreferences { return { ...this._preferences }; }
  get alertHistory(): SensorAlertRecord[] { return [...this._alertHistory]; }
  get lastActiveAt(): Date { return this._lastActiveAt; }

  get isOnline(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this._lastActiveAt > fiveMinutesAgo && this._status !== 'inactive';
  }

  get unresolvedAlertCount(): number {
    return this._alertHistory.filter(a => !a.resolved).length;
  }

  hasLeakSignature(): boolean {
    return this._preferences.detectLeaks &&
           this.currentFlowLPM > 0 &&
           this.currentFlowLPM < 0.5 &&
           this._status === 'active';
  }

  updatePreferences(updates: Partial<SensorMonitoringPreferences>): void {
    this._preferences = { ...this._preferences, ...updates };
  }

  activate(): void {
    this._status = 'active';
    this._lastActiveAt = new Date();
  }

  deactivate(): void {
    this._status = 'inactive';
  }

  recordAlert(alert: SensorAlertRecord): void {
    this._alertHistory.push(alert);
    if (alert.severity === 'high' || alert.severity === 'critical') {
      this._status = 'warning';
    }
  }
}
