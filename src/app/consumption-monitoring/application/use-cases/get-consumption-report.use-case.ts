/**
 * Consumption Monitoring — GetConsumptionReportUseCase
 *
 * Pertenece a: consumption-monitoring/application/use-cases
 * Recupera el reporte completo de consumo para la pantalla de Reportes.
 */
import { Injectable, inject } from '@angular/core';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { ConsumptionReport } from '../../domain/aggregates/consumption-session.aggregate';

@Injectable()
export class GetConsumptionReportUseCase {
  private readonly repo = inject(ConsumptionSessionRepository);

  execute(userId: string): ConsumptionReport | null {
    return this.repo.findReport(userId);
  }
}
