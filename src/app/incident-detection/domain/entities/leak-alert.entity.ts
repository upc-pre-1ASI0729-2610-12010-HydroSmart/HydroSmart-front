import { Entity } from '../../../shared/domain/base/entity.base';
import { IncidentSeverity } from '../enums/incident-severity.enum';
import { IncidentStatus } from '../enums/incident-status.enum';

export type AlertType = 'leak' | 'anomaly' | 'threshold' | 'goal' | 'info';

export class LeakAlert extends Entity {
  private _status: IncidentStatus;
  private _acknowledgedAt: Date | null;
  private _estimatedLossLiters: number;

  constructor(
    id: string,
    public readonly incidentId: string,
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly type: AlertType,
    public readonly title: string,
    public readonly message: string,
    public readonly severity: IncidentSeverity,
    public readonly detectedAt: Date,
    estimatedLossLiters: number
  ) {
    super(id);
    this._status = IncidentStatus.ACTIVE;
    this._acknowledgedAt = null;
    this._estimatedLossLiters = estimatedLossLiters;
  }

  get status(): IncidentStatus { return this._status; }
  get acknowledgedAt(): Date | null { return this._acknowledgedAt; }
  get estimatedLossLiters(): number { return this._estimatedLossLiters; }

  get isActive(): boolean { return this._status === IncidentStatus.ACTIVE; }
  get isResolved(): boolean { return this._status === IncidentStatus.RESOLVED; }

  // Comportamiento: la alerta sabe si requiere acción inmediata
  requiresImmediateAction(): boolean {
    return this._status === IncidentStatus.ACTIVE &&
      (this.severity === IncidentSeverity.CRITICAL || this.severity === IncidentSeverity.HIGH);
  }

  // Comportamiento: calcula las horas que lleva activa
  hoursOpen(): number {
    const end = new Date();
    return (end.getTime() - this.detectedAt.getTime()) / (1000 * 60 * 60);
  }

  // Comportamiento: actualiza la pérdida estimada basado en las horas activa
  recalculateEstimatedLoss(flowRateLPH: number): void {
    this._estimatedLossLiters = flowRateLPH * this.hoursOpen();
  }

  acknowledge(): void {
    if (this._status === IncidentStatus.ACTIVE) {
      this._status = IncidentStatus.ACKNOWLEDGED;
      this._acknowledgedAt = new Date();
    }
  }
}
