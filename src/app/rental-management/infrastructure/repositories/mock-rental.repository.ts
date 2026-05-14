/**
 * Rental Management — MockRentalRepository
 *
 * Pertenece a: rental-management/infrastructure/repositories
 * Hidrata TenantConsumption aggregates desde el JSON de arrendamientos.
 */
import { Injectable } from '@angular/core';
import { RentalRepository } from '../../domain/repositories/rental.repository';
import { TenantConsumption } from '../../domain/aggregates/tenant-consumption.aggregate';
import { RentalUnit } from '../../domain/entities/rental-unit.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { ConsumptionAllowance } from '../../domain/value-objects/consumption-allowance.vo';
import rentalsJson from '../mock-data/rentals.json';

@Injectable()
export class MockRentalRepository extends RentalRepository {
  private records: TenantConsumption[] = this.hydrateRecords();

  findByOwnerId(ownerId: string): TenantConsumption[] {
    return this.records.filter(r => r.ownerId === ownerId);
  }

  findById(id: string): TenantConsumption | null {
    return this.records.find(r => r.id === id) ?? null;
  }

  save(tc: TenantConsumption): void {
    const idx = this.records.findIndex(r => r.id === tc.id);
    if (idx >= 0) this.records[idx] = tc;
    else this.records.push(tc);
  }

  private hydrateRecords(): TenantConsumption[] {
    return (rentalsJson as any[]).map(raw => {
      const unit = new RentalUnit(
        raw.rentalUnit.id,
        raw.rentalUnit.ownerId,
        raw.rentalUnit.address,
        raw.rentalUnit.unitNumber,
        ConsumptionAllowance.of(
          raw.rentalUnit.allowance.monthlyLimitLiters,
          raw.rentalUnit.allowance.penaltyPerExcessLiter,
          raw.rentalUnit.allowance.currency
        )
      );

      const tenant = new Tenant(
        raw.tenant.id,
        raw.tenant.rentalUnitId,
        raw.tenant.name,
        raw.tenant.email,
        raw.tenant.phone,
        raw.tenant.currentMonthConsumptionLiters
      );

      return new TenantConsumption(raw.id, raw.ownerId, unit, tenant, raw.period);
    });
  }
}
