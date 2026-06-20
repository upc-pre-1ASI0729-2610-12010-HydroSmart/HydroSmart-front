/**
 * Consumption Monitoring — GetConsumptionSummaryUseCase
 *
 * Pertenece a: consumption-monitoring/application/use-cases
 * Por qué application: recupera y proyecta los datos del aggregate hacia
 * la capa de presentación. No altera el estado del dominio.
 */
import { Injectable, inject } from '@angular/core';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

export interface ConsumptionSummaryDto {
  totalVolumeLiters: number;
  variationPercent: number;
  estimatedCostPEN: number;
  currentDayVolumeLiters: number;
  averageDailyVolumeLiters: number;
  categoryBreakdown: Array<{ category: string; volumeLiters: number; percentage: number }>;
  dailyLabels: string[];
  dailyValues: number[];
  isDecreasing: boolean;
}

@Injectable()
export class GetConsumptionSummaryUseCase {
  private readonly repo = inject(ConsumptionSessionRepository);

  execute(userId: string): ConsumptionSummaryDto | null {
    const session = this.repo.findCurrentByUserId(userId);
    if (!session) return null;

    const averageVolume = session.calculateAverageConsumption();
    const variationPercent = session.calculatePeriodVariation();

    return {
      totalVolumeLiters: session.totalVolume.liters,
      variationPercent,
      estimatedCostPEN: session.estimatedCostPEN,
      currentDayVolumeLiters: session.currentDayVolumeLiters,
      averageDailyVolumeLiters: averageVolume.liters,
      categoryBreakdown: session.categoryBreakdown,
      dailyLabels: session.getDailyLabels(),
      dailyValues: session.getDailyValues(),
      isDecreasing: variationPercent < 0
    };
  }
}
