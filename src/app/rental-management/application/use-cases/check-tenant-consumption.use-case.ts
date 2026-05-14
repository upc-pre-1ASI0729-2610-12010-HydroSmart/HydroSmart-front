/**
 * Rental Management — CheckTenantConsumptionUseCase
 *
 * Pertenece a: rental-management/application/use-cases
 * Verifica todos los inquilinos de un propietario y emite eventos
 * para aquellos que superaron su cupo contractual.
 */
import { Injectable, inject } from '@angular/core';
import { RentalRepository } from '../../domain/repositories/rental.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';

export interface TenantConsumptionStatus {
  tenantId: string;
  tenantName: string;
  rentalUnit: string;
  currentLiters: number;
  allowedLiters: number;
  exceeded: boolean;
  penaltyAmount: number;
}

@Injectable()
export class CheckTenantConsumptionUseCase {
  private readonly repo = inject(RentalRepository);
  private readonly eventBus = inject(DomainEventBus);

  execute(ownerId: string): TenantConsumptionStatus[] {
    const tenantConsumptions = this.repo.findByOwnerId(ownerId);
    const results: TenantConsumptionStatus[] = [];

    for (const tc of tenantConsumptions) {
      const exceeded = tc.checkConsumption();
      this.eventBus.dispatchFromAggregate(tc);

      results.push({
        tenantId: tc.tenant.id,
        tenantName: tc.tenant.name,
        rentalUnit: tc.rentalUnit.displayName(),
        currentLiters: tc.tenant.currentMonthConsumption.liters,
        allowedLiters: tc.allowance.monthlyLimit.liters,
        exceeded,
        penaltyAmount: exceeded ? tc.allowance.calculatePenalty(tc.tenant.currentMonthConsumption) : 0
      });
    }
    return results;
  }
}