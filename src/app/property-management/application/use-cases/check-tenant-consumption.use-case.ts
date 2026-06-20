import { Injectable, inject } from '@angular/core';
import { PropertyManagementRepository } from '../../domain/repositories/property-management.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';

export interface TenantConsumptionStatus {
  tenantId: string;
  tenantName: string;
  unit: string;
  currentLiters: number;
  allowedLiters: number;
  exceeded: boolean;
  penaltyAmount: number;
}

@Injectable()
export class CheckTenantConsumptionUseCase {
  private readonly repo = inject(PropertyManagementRepository);
  private readonly eventBus = inject(DomainEventBus);

  execute(adminUserId: string): TenantConsumptionStatus[] {
    const tenantConsumptions = this.repo.findByAdminUserId(adminUserId);
    const results: TenantConsumptionStatus[] = [];

    for (const tc of tenantConsumptions) {
      const exceeded = tc.checkConsumption();
      this.eventBus.dispatchFromAggregate(tc);

      results.push({
        tenantId: tc.tenant.id,
        tenantName: tc.tenant.name,
        unit: tc.unit.displayName(),
        currentLiters: tc.tenant.currentMonthConsumption.liters,
        allowedLiters: tc.allowance.monthlyLimit.liters,
        exceeded,
        penaltyAmount: exceeded ? tc.allowance.calculatePenalty(tc.tenant.currentMonthConsumption) : 0
      });
    }
    return results;
  }
}
