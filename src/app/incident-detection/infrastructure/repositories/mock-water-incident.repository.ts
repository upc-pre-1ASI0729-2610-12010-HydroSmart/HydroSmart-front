import { Injectable } from '@angular/core';
import { WaterIncidentRepository } from '../../domain/repositories/water-incident.repository';
import { WaterIncident } from '../../domain/aggregates/water-incident.aggregate';
import { LeakAlert } from '../../domain/entities/leak-alert.entity';
import { IncidentSeverity } from '../../domain/enums/incident-severity.enum';
import { IncidentStatus } from '../../domain/enums/incident-status.enum';
import alertsJson from '../mock-data/alerts.json';

@Injectable()
export class MockWaterIncidentRepository extends WaterIncidentRepository {
  private incidents: WaterIncident[] = this.hydrateIncidents();

  findAllByUserId(userId: string): WaterIncident[] {
    return this.incidents.filter(i => i.userId === userId);
  }

  findById(id: string): WaterIncident | null {
    return this.incidents.find(i => i.id === id) ?? null;
  }

  findActive(userId: string): WaterIncident[] {
    return this.findAllByUserId(userId).filter(i => i.isActive || i.isEscalated);
  }

  save(incident: WaterIncident): void {
    const idx = this.incidents.findIndex(i => i.id === incident.id);
    if (idx >= 0) {
      this.incidents[idx] = incident;
    } else {
      this.incidents.push(incident);
    }
  }

  private hydrateIncidents(): WaterIncident[] {
    return (alertsJson as any[]).map(raw => {
      const severityMap: Record<string, IncidentSeverity> = {
        critical: IncidentSeverity.CRITICAL, high: IncidentSeverity.HIGH,
        medium: IncidentSeverity.MEDIUM, low: IncidentSeverity.LOW
      };
      const statusMap: Record<string, IncidentStatus> = {
        active: IncidentStatus.ACTIVE, acknowledged: IncidentStatus.ACKNOWLEDGED,
        resolved: IncidentStatus.RESOLVED
      };

      const alert = new LeakAlert(
        raw.id, `inc-${raw.id}`, raw.userId, raw.deviceId,
        raw.type, raw.title, raw.message,
        severityMap[raw.severity] ?? IncidentSeverity.MEDIUM,
        new Date(raw.detectedAt), raw.estimatedLoss ?? 0
      );

      return new WaterIncident(
        `inc-${raw.id}`,
        raw.userId,
        raw.deviceId,
        new Date(raw.detectedAt),
        [alert],
        severityMap[raw.severity] ?? IncidentSeverity.MEDIUM,
        statusMap[raw.status] ?? IncidentStatus.ACTIVE,
        null
      );
    });
  }
}
