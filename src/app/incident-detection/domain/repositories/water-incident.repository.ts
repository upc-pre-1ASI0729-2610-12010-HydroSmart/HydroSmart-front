import { WaterIncident } from '../aggregates/water-incident.aggregate';

export abstract class WaterIncidentRepository {
  abstract findAllByUserId(userId: string): WaterIncident[];
  abstract findById(id: string): WaterIncident | null;
  abstract save(incident: WaterIncident): void;
  abstract findActive(userId: string): WaterIncident[];
}
