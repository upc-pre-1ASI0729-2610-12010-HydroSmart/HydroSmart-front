import { Injectable, inject } from '@angular/core';
import { PropertyManagementRepository } from '../../domain/repositories/property-management.repository';
import { ConsumptionPenalty } from '../../domain/aggregates/tenant-consumption.aggregate';

@Injectable()
export class GenerateConsumptionPenaltyUseCase {
  private readonly repo = inject(PropertyManagementRepository);

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
