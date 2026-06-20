import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WaterIncidentRepository } from '../../domain/repositories/water-incident.repository';
import { WaterIncident } from '../../domain/aggregates/water-incident.aggregate';
import { LeakAlert, AlertType } from '../../domain/entities/leak-alert.entity';
import { IncidentSeverity } from '../../domain/enums/incident-severity.enum';
import { IncidentStatus } from '../../domain/enums/incident-status.enum';
import { ApiResponse } from '../../../shared/infrastructure/http/api-response.model';
import { environment } from '../../../../environments/environment';

interface AlertDTO {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  detectedAt: string;
  estimatedLoss: number;
  sensorId: number;
  sensorName: string;
  unitNumber: string;
}

@Injectable()
export class HttpWaterIncidentRepository extends WaterIncidentRepository {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private _cache = signal<WaterIncident[]>([]);

  async preload(buildingId: string): Promise<void> {
    try {
      const numId = this.numericId(buildingId);
      const res = await firstValueFrom(
        this.http.get<ApiResponse<AlertDTO[]>>(
          `${this.api}/alerts?buildingId=${numId}`
        )
      );
      if (res.success && res.data) {
        this._cache.set(res.data.map(dto => this.mapToIncident(dto)));
      }
    } catch (err) { console.error('Error loading alerts:', err); }
  }

  findAllByUserId(_userId: string): WaterIncident[] {
    return this._cache();
  }

  findById(id: string): WaterIncident | null {
    return this._cache().find(i => i.id === id) ?? null;
  }

  findActive(_userId: string): WaterIncident[] {
    return this._cache().filter(i => i.isActive || i.isEscalated);
  }

  save(incident: WaterIncident): void {
    if (incident.isResolved) {
      const numericId = incident.id.replace('inc-', '');
      firstValueFrom(
        this.http.put<ApiResponse<AlertDTO>>(
          `${this.api}/alerts/${numericId}/resolve`, {}
        )
      ).catch(err => console.error('Error resolving alert:', err));
    }
    const idx = this._cache().findIndex(i => i.id === incident.id);
    const updated = [...this._cache()];
    if (idx >= 0) updated[idx] = incident;
    else updated.push(incident);
    this._cache.set(updated);
  }

  private mapToIncident(dto: AlertDTO): WaterIncident {
    const severityMap: Record<string, IncidentSeverity> = {
      critical: IncidentSeverity.CRITICAL,
      high: IncidentSeverity.HIGH,
      medium: IncidentSeverity.MEDIUM,
      low: IncidentSeverity.LOW
    };
    const statusMap: Record<string, IncidentStatus> = {
      active: IncidentStatus.ACTIVE,
      acknowledged: IncidentStatus.ACKNOWLEDGED,
      resolved: IncidentStatus.RESOLVED
    };

    const alert = new LeakAlert(
      String(dto.id),
      `inc-${dto.id}`,
      'building',
      String(dto.sensorId),
      dto.type as AlertType,
      dto.title,
      dto.message,
      severityMap[dto.severity] ?? IncidentSeverity.MEDIUM,
      new Date(dto.detectedAt),
      dto.estimatedLoss ?? 0
    );

    return new WaterIncident(
      `inc-${dto.id}`,
      'building',
      String(dto.sensorId),
      new Date(dto.detectedAt),
      [alert],
      severityMap[dto.severity] ?? IncidentSeverity.MEDIUM,
      statusMap[dto.status] ?? IncidentStatus.ACTIVE,
      null
    );
  }

  private numericId(id: string): number {
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : parseInt(id, 10) || 1;
  }
}
