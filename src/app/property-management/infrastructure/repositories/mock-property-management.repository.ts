import { Injectable } from '@angular/core';
import { PropertyManagementRepository } from '../../domain/repositories/property-management.repository';
import { TenantConsumption } from '../../domain/aggregates/tenant-consumption.aggregate';
import { Unit } from '../../domain/entities/unit.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { ConsumptionAllowance } from '../../domain/value-objects/consumption-allowance.vo';
import rentalsJson from '../mock-data/rentals.json';

@Injectable()
export class MockPropertyManagementRepository extends PropertyManagementRepository {
  private records: TenantConsumption[] = this.hydrateRecords();

  findByAdminUserId(adminUserId: string): TenantConsumption[] {
    return this.records.filter(r => r.adminUserId === adminUserId);
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
      const unit = new Unit(
        raw.unit.id,
        raw.unit.buildingId,
        raw.unit.unitNumber,
        raw.unit.floor,
        ConsumptionAllowance.of(
          raw.unit.allowance.monthlyLimitLiters,
          raw.unit.allowance.penaltyPerExcessLiter,
          raw.unit.allowance.currency
        ),
        raw.unit.tenantUserId ?? null
      );

      const tenant = new Tenant(
        raw.tenant.id,
        raw.tenant.unitId,
        raw.tenant.name,
        raw.tenant.email,
        raw.tenant.phone,
        raw.tenant.currentMonthConsumptionLiters
      );

      return new TenantConsumption(raw.id, raw.adminUserId, unit, tenant, raw.period);
    });
  }
}
