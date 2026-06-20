import { Injectable, inject, signal } from '@angular/core';
import { CheckTenantConsumptionUseCase, TenantConsumptionStatus } from '../use-cases/check-tenant-consumption.use-case';
import { GenerateConsumptionPenaltyUseCase } from '../use-cases/generate-consumption-penalty.use-case';
import { ConsumptionPenalty } from '../../domain/aggregates/tenant-consumption.aggregate';

@Injectable()
export class PropertyManagementService {
  private readonly checkUseCase = inject(CheckTenantConsumptionUseCase);
  private readonly penaltyUseCase = inject(GenerateConsumptionPenaltyUseCase);

  private _tenantStatuses = signal<TenantConsumptionStatus[]>([]);
  readonly tenantStatuses = this._tenantStatuses.asReadonly();

  initialize(adminUserId: string): void {
    this._tenantStatuses.set(this.checkUseCase.execute(adminUserId));
  }

  generatePenalty(tenantConsumptionId: string): ConsumptionPenalty | null {
    return this.penaltyUseCase.execute(tenantConsumptionId);
  }
}
