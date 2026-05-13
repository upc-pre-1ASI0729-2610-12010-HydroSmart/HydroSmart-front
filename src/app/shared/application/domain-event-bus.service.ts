/**
 * Shared Kernel — Domain Event Bus
 *
 * Pertenece a: shared/application
 * Por qué aquí: el bus de eventos desacopla los bounded contexts. Cuando
 * ConsumptionMonitoring detecta una anomalía, emite un evento; IncidentDetection
 * lo escucha y crea un incidente sin que los contextos se conozcan directamente.
 *
 * Implementación: servicio Angular con signals para reactividad. Los handlers
 * son funciones registradas por los application services de cada contexto.
 */
import { Injectable, signal } from '@angular/core';
import { DomainEvent } from '../domain/base/domain-event.base';
import { AggregateRoot } from '../domain/base/aggregate-root.base';

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void;

@Injectable({ providedIn: 'root' })
export class DomainEventBus {
  private handlers = new Map<string, EventHandler[]>();

  // Signal reactivo para que componentes puedan observar el último evento
  private _lastEvent = signal<DomainEvent | null>(null);
  readonly lastEvent = this._lastEvent.asReadonly();

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler as EventHandler]);
  }

  publish(event: DomainEvent): void {
    this._lastEvent.set(event);
    const eventHandlers = this.handlers.get(event.eventType) ?? [];
    eventHandlers.forEach(h => {
      try {
        h(event);
      } catch (err) {
        console.error(`[DomainEventBus] Error en handler de ${event.eventType}:`, err);
      }
    });
  }

  publishAll(events: ReadonlyArray<DomainEvent>): void {
    events.forEach(e => this.publish(e));
  }

  // Conveniencia: publica los eventos de un aggregate y los limpia
  dispatchFromAggregate(aggregate: AggregateRoot): void {
    this.publishAll(aggregate.domainEvents);
    aggregate.clearDomainEvents();
  }
}
