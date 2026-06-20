import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { Unit } from '../entities/unit.entity';
import { Tenant } from '../entities/tenant.entity';
import { ConsumptionAllowance } from '../value-objects/consumption-allowance.vo';
import { TenantExceededConsumptionLimit } from '../events/tenant-exceeded-consumption-limit.event';

export interface ConsumptionPenalty {
  tenantId: string;
  unitId: string;
  period: string;
  excessLiters: number;
  penaltyAmount: number;
  currency: string;
  generatedAt: Date;
}

export class TenantConsumption extends AggregateRoot {
  constructor(
    id: string,
    public readonly adminUserId: string,
    public readonly unit: Unit,
    public readonly tenant: Tenant,
    public readonly period: string
  ) {
    super(id);
  }

  get allowance(): ConsumptionAllowance {
    return this.unit.allowance;
  }

  checkConsumption(): boolean {
    const actual = this.tenant.currentMonthConsumption;
    const exceeded = this.allowance.isViolatedBy(actual);

    if (exceeded) {
      const penalty = this.allowance.calculatePenalty(actual);
      this.addDomainEvent(new TenantExceededConsumptionLimit(
        this.tenant.id,
        this.adminUserId,
        this.unit.id,
        this.allowance.monthlyLimit.liters,
        actual.liters,
        penalty,
        'PEN'
      ));
    }
    return exceeded;
  }

  generateConsumptionPenalty(): ConsumptionPenalty | null {
    const actual = this.tenant.currentMonthConsumption;
    if (!this.allowance.isViolatedBy(actual)) return null;

    return {
      tenantId: this.tenant.id,
      unitId: this.unit.id,
      period: this.period,
      excessLiters: this.allowance.excessVolume(actual).liters,
      penaltyAmount: this.allowance.calculatePenalty(actual),
      currency: 'PEN',
      generatedAt: new Date()
    };
  }
}
