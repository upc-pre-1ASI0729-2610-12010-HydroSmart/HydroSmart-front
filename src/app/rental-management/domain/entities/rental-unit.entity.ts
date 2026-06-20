/**
 * Rental Management — RentalUnit Entity
 *
 * Pertenece a: rental-management/domain/entities
 * Representa un departamento o unidad de arriendo con sus métricas de consumo.
 */
import { Entity } from '../../../shared/domain/base/entity.base';
import { ConsumptionAllowance } from '../value-objects/consumption-allowance.vo';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

export class RentalUnit extends Entity {
  constructor(
    id: string,
    public readonly ownerId: string,
    public readonly address: string,
    public readonly unitNumber: string,
    public readonly allowance: ConsumptionAllowance
  ) {
    super(id);
  }

  displayName(): string {
    return `Dpto. ${this.unitNumber} — ${this.address}`;
  }

  isPenaltyApplicable(consumption: WaterVolume): boolean {
    return this.allowance.isViolatedBy(consumption);
  }

  calculateMonthlyPenalty(consumption: WaterVolume): number {
    return this.allowance.calculatePenalty(consumption);
  }
}
