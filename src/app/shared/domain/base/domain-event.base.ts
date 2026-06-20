/**
 * Shared Kernel — Domain Event Base
 *
 * Pertenece a: shared/domain/base
 * Por qué aquí: todos los contextos emiten eventos del dominio. Esta clase
 * define el contrato mínimo: tipo único del evento y timestamp de ocurrencia.
 * Los contextos extienden esta clase para sus eventos concretos.
 */
export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public abstract readonly eventType: string;

  protected constructor() {
    this.occurredAt = new Date();
  }
}
