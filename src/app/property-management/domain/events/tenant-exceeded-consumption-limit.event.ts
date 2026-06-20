import { DomainEvent } from '../../../shared/domain/base/domain-event.base';

export class TenantExceededConsumptionLimit extends DomainEvent {
  readonly eventType = 'TenantExceededConsumptionLimit';

  constructor(
    public readonly tenantId: string,
    public readonly adminUserId: string,
    public readonly unitId: string,
    public readonly allowedLiters: number,
    public readonly actualLiters: number,
    public readonly penaltyAmount: number,
    public readonly currency: string
  ) {
    super();
  }

  get excessLiters(): number {
    return this.actualLiters - this.allowedLiters;
  }
}
