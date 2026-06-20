/**
 * Consumption Monitoring — DetectAnomalyUseCase
 *
 * Pertenece a: consumption-monitoring/application/use-cases
 * Por qué application: orquesta el dominio sin contener reglas de negocio.
 * El use case: (1) obtiene el aggregate del repositorio,
 * (2) delega al aggregate la detección (lógica de negocio),
 * (3) publica los eventos generados al bus global.
 * NO decide qué es anómalo — eso lo hace ConsumptionSession.
 */
import { Injectable, inject } from '@angular/core';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';
import { AnomalyResult } from '../../domain/aggregates/consumption-session.aggregate';

@Injectable()
export class DetectAnomalyUseCase {
  private readonly repo = inject(ConsumptionSessionRepository);
  private readonly eventBus = inject(DomainEventBus);

  execute(userId: string): AnomalyResult | null {
    const session = this.repo.findCurrentByUserId(userId);
    if (!session) return null;

    const result = session.detectAnomaly();

    // Publica los eventos generados por el aggregate al bus compartido
    this.eventBus.dispatchFromAggregate(session);

    return result;
  }
}
