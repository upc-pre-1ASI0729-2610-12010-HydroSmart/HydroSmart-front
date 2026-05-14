/**
 * Rental Management — Tenant Entity
 *
 * Pertenece a: rental-management/domain/entities
 * El inquilino con sus datos de consumo en el período actual.
 */
import { Entity } from '../../../shared/domain/base/entity.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

export class Tenant extends Entity {
  constructor(
    id: string,
    public readonly rentalUnitId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    private _currentMonthConsumptionLiters: number
  ) {
    super(id);
  }

  get currentMonthConsumption(): WaterVolume {
    return WaterVolume.ofLiters(this._currentMonthConsumptionLiters);
  }

  // Comportamiento: actualiza el consumo del mes vigente
  recordConsumption(liters: number): void {
    this._currentMonthConsumptionLiters = liters;
  }
}
