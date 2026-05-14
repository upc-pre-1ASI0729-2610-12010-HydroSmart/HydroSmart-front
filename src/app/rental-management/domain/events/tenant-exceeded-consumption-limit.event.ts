/**
 * Rental Management — TenantExceededConsumptionLimit Domain Event
 *
 * Emitido cuando TenantConsumption detecta que el inquilino superó su cupo contractual.
 * El propietario (landlord) puede generar una penalidad al recibir este evento.
 */
import { DomainEvent } from '../../../shared/domain/base/domain-event.base';

export class TenantExceededConsumptionLimit extends DomainEvent {
  readonly eventType = 'TenantExceededConsumptionLimit';

  constructor(
    public readonly tenantId: string,
    public readonly ownerId: string,
    public readonly rentalUnitId: string,
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
