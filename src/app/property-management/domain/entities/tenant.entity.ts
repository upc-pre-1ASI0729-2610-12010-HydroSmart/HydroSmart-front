import { Entity } from '../../../shared/domain/base/entity.base';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';

export class Tenant extends Entity {
  constructor(
    id: string,
    public readonly unitId: string,
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

  recordConsumption(liters: number): void {
    this._currentMonthConsumptionLiters = liters;
  }
}
