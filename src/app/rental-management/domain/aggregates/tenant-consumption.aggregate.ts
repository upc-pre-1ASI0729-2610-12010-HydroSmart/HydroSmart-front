/**
 * Rental Management — TenantConsumption Aggregate Root
 *
 * Pertenece a: rental-management/domain/aggregates
 * Por qué domain: protege las invariantes contractuales del arrendamiento.
 * Sabe cuándo un inquilino excedió su cupo y genera la penalidad correspondiente.
 *
 * Comportamientos del negocio:
 *   - checkConsumption(): verifica si el inquilino superó su cupo
 *   - generateConsumptionPenalty(): calcula y aplica la penalidad del propietario
 */
import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { RentalUnit } from '../entities/rental-unit.entity';
import { Tenant } from '../entities/tenant.entity';
import { ConsumptionAllowance } from '../value-objects/consumption-allowance.vo';
import { TenantExceededConsumptionLimit } from '../events/tenant-exceeded-consumption-limit.event';

export interface ConsumptionPenalty {
  tenantId: string;
  rentalUnitId: string;
  period: string;
  excessLiters: number;
  penaltyAmount: number;
  currency: string;
  generatedAt: Date;
}

export class TenantConsumption extends AggregateRoot {
  constructor(
    id: string,
    public readonly ownerId: string,
    public readonly rentalUnit: RentalUnit,
    public readonly tenant: Tenant,
    public readonly period: string
  ) {
    super(id);
  }

  get allowance(): ConsumptionAllowance {
    return this.rentalUnit.allowance;
  }

  /**
   * Comportamiento: verifica si el inquilino excedió su cupo contractual.
   * Si lo excedió, emite el evento TenantExceededConsumptionLimit.
   */
  checkConsumption(): boolean {
    const actual = this.tenant.currentMonthConsumption;
    const exceeded = this.allowance.isViolatedBy(actual);

    if (exceeded) {
      const penalty = this.allowance.calculatePenalty(actual);
      this.addDomainEvent(new TenantExceededConsumptionLimit(
        this.tenant.id,
        this.ownerId,
        this.rentalUnit.id,
        this.allowance.monthlyLimit.liters,
        actual.liters,
        penalty,
        'PEN'
      ));
    }
    return exceeded;
  }

  /**
   * Comportamiento: el propietario genera la penalidad formal al inquilino.
   * Solo aplica si realmente excedió el cupo.
   */
  generateConsumptionPenalty(): ConsumptionPenalty | null {
    const actual = this.tenant.currentMonthConsumption;
    if (!this.allowance.isViolatedBy(actual)) return null;

    return {
      tenantId: this.tenant.id,
      rentalUnitId: this.rentalUnit.id,
      period: this.period,
      excessLiters: this.allowance.excessVolume(actual).liters,
      penaltyAmount: this.allowance.calculatePenalty(actual),
      currency: 'PEN',
      generatedAt: new Date()
    };
  }
}
