import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { LeakAlert } from '../entities/leak-alert.entity';
import { IncidentResolution, ResolutionType } from '../entities/incident-resolution.entity';
import { IncidentSeverity } from '../enums/incident-severity.enum';
import { IncidentStatus } from '../enums/incident-status.enum';

export class WaterIncident extends AggregateRoot {
  private _status: IncidentStatus;
  private _severity: IncidentSeverity;
  private _resolution: IncidentResolution | null = null;
  private _escalations: Array<{ at: Date; reason: string }> = [];

  constructor(
    id: string,
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly openedAt: Date,
    private _alerts: LeakAlert[],
    severity: IncidentSeverity,
    status: IncidentStatus,
    resolution: IncidentResolution | null = null
  ) {
    super(id);
    this._severity = severity;
    this._status = status;
    this._resolution = resolution;
  }

  static open(params: {
    id: string;
    userId: string;
    deviceId: string;
    initialAlert: LeakAlert;
    severity: IncidentSeverity;
  }): WaterIncident {
    const incident = new WaterIncident(
      params.id,
      params.userId,
      params.deviceId,
      new Date(),
      [params.initialAlert],
      params.severity,
      IncidentStatus.ACTIVE
    );
    return incident;
  }

  get status(): IncidentStatus { return this._status; }
  get severity(): IncidentSeverity { return this._severity; }
  get resolution(): IncidentResolution | null { return this._resolution; }
  get alerts(): LeakAlert[] { return [...this._alerts]; }
  get escalations() { return [...this._escalations]; }

  get isActive(): boolean { return this._status === IncidentStatus.ACTIVE; }
  get isResolved(): boolean { return this._status === IncidentStatus.RESOLVED; }
  get isEscalated(): boolean { return this._status === IncidentStatus.ESCALATED; }

  get hoursOpen(): number {
    const end = this._resolution?.resolvedAt ?? new Date();
    return (end.getTime() - this.openedAt.getTime()) / (1000 * 60 * 60);
  }

  get primaryAlert(): LeakAlert | null {
    return this._alerts[0] ?? null;
  }

  get title(): string { return this.primaryAlert?.title ?? 'Incidente sin título'; }
  get message(): string { return this.primaryAlert?.message ?? ''; }

  // Comportamiento: escala el incidente cuando la situación se agrava
  escalateIncident(reason: string): void {
    if (!this.isActive) {
      throw new Error('Solo se puede escalar un incidente activo');
    }
    this._status = IncidentStatus.ESCALATED;
    this._escalations.push({ at: new Date(), reason });

    if (this._severity !== IncidentSeverity.CRITICAL) {
      const levels = [IncidentSeverity.LOW, IncidentSeverity.MEDIUM,
        IncidentSeverity.HIGH, IncidentSeverity.CRITICAL];
      const currentIdx = levels.indexOf(this._severity);
      this._severity = levels[Math.min(currentIdx + 1, 3)];
    }
  }

  // Comportamiento: cierra el incidente con información de resolución
  resolveIncident(params: {
    resolvedBy: string;
    type: ResolutionType;
    notes: string;
    actualLossLiters: number;
  }): void {
    if (this.isResolved) {
      throw new Error('El incidente ya fue resuelto');
    }

    this._resolution = new IncidentResolution(
      `res-${this.id}`,
      this.id,
      new Date(),
      params.resolvedBy,
      params.type,
      params.notes,
      params.actualLossLiters
    );
    this._status = IncidentStatus.RESOLVED;

    // Resuelve todas las alertas activas asociadas
    this._alerts.forEach(alert => {
      if (alert.isActive) alert.acknowledge();
    });
  }

  // Comportamiento: reconoce el incidente sin resolverlo (lo vio el operador)
  acknowledge(): void {
    if (this._status === IncidentStatus.ACTIVE) {
      this._status = IncidentStatus.ACKNOWLEDGED;
      this._alerts.forEach(a => a.acknowledge());
    }
  }

  addAlert(alert: LeakAlert): void {
    this._alerts.push(alert);
  }
}
