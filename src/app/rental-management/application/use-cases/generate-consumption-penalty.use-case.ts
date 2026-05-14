/**
 * Rental Management — GenerateConsumptionPenaltyUseCase
 *
 * Pertenece a: rental-management/application/use-cases
 * El propietario genera la penalidad formal para un inquilino específico.
 * La regla de si aplica penalidad la decide el aggregate TenantConsumption.
 */
import { Injectable, inject } from '@angular/core';
import { RentalRepository } from '../../domain/repositories/rental.repository';
import { ConsumptionPenalty } from '../../domain/aggregates/tenant-consumption.aggregate';

@Injectable()
export class GenerateConsumptionPenaltyUseCase {
  private readonly repo = inject(RentalRepository);

  execute(tenantConsumptionId: string): ConsumptionPenalty | null {
    const tc = this.repo.findById(tenantConsumptionId);
    if (!tc) return null;

    const penalty = tc.generateConsumptionPenalty();
    if (penalty) {
      this.repo.save(tc);
    }
    return penalty;
  }
}
