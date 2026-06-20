import { Entity } from '../../../shared/domain/base/entity.base';
import { ConsumptionAllowance } from '../value-objects/consumption-allowance.vo';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

export class Unit extends Entity {
  constructor(
    id: string,
    public readonly buildingId: string,
    public readonly unitNumber: string,
    public readonly floor: number,
    public readonly allowance: ConsumptionAllowance,
    public readonly tenantUserId: string | null = null
  ) {
    super(id);
  }

  displayName(): string {
    return `Unidad ${this.unitNumber} — Piso ${this.floor}`;
  }

  isPenaltyApplicable(consumption: WaterVolume): boolean {
    return this.allowance.isViolatedBy(consumption);
  }

  calculateMonthlyPenalty(consumption: WaterVolume): number {
    return this.allowance.calculatePenalty(consumption);
  }
}
