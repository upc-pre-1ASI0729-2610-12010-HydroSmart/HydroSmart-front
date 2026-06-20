/**
 * Shared Kernel — Aggregate Root Base
 *
 * Pertenece a: shared/domain/base
 * Por qué aquí: los Aggregate Roots son el único punto de entrada al aggregate.
 * Manejan invariantes y acumulan Domain Events que luego se publican al bus.
 * Todos los aggregates del sistema extienden esta clase.
 */
import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.base';

export abstract class AggregateRoot<TId = string> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }
}
