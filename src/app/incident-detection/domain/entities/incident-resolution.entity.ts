import { Entity } from '../../../shared/domain/base/entity.base';

export type ResolutionType = 'repaired' | 'false-alarm' | 'automatic' | 'preventive';

export class IncidentResolution extends Entity {
  constructor(
    id: string,
    public readonly incidentId: string,
    public readonly resolvedAt: Date,
    public readonly resolvedBy: string,
    public readonly type: ResolutionType,
    public readonly notes: string,
    public readonly actualLossLiters: number
  ) {
    super(id);
    if (!notes.trim()) throw new Error('La resolución debe incluir notas');
  }

  // Comportamiento: calcula el tiempo total de resolución desde la apertura
  resolutionTimeHours(openedAt: Date): number {
    return (this.resolvedAt.getTime() - openedAt.getTime()) / (1000 * 60 * 60);
  }

  wasFalseAlarm(): boolean {
    return this.type === 'false-alarm';
  }
}
