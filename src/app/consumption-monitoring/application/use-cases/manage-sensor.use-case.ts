/**
 * Consumption Monitoring — ManageSensorUseCase
 *
 * Pertenece a: consumption-monitoring/application/use-cases
 * Por qué application: orquesta las operaciones sobre IoTSensor (activar,
 * desactivar, actualizar preferencias) delegando al repositorio para persistir.
 * También verifica si hay señal de fuga y emite el evento correspondiente.
 */
import { Injectable, inject } from '@angular/core';
import { ConsumptionSessionRepository } from '../../domain/repositories/consumption-session.repository';
import { DomainEventBus } from '../../../shared/application/domain-event-bus.service';
import { SensorMonitoringPreferences } from '../../domain/entities/iot-sensor.entity';
import { WaterLeakDetected } from '../../../incident-detection/domain/events/water-leak-detected.event';

@Injectable()
export class ManageSensorUseCase {
  private readonly repo = inject(ConsumptionSessionRepository);
  private readonly eventBus = inject(DomainEventBus);

  updatePreferences(userId: string, sensorId: string, prefs: Partial<SensorMonitoringPreferences>): void {
    const sensors = this.repo.findAllSensors(userId);
    const sensor = sensors.find(s => s.id === sensorId);
    if (!sensor) return;

    sensor.updatePreferences(prefs);
    this.repo.saveSensorPreferences(sensor);
  }

  toggleActivation(userId: string, sensorId: string): void {
    const sensors = this.repo.findAllSensors(userId);
    const sensor = sensors.find(s => s.id === sensorId);
    if (!sensor) return;

    if (sensor.status === 'active') {
      sensor.deactivate();
    } else {
      sensor.activate();
    }
    this.repo.saveSensorPreferences(sensor);
  }

  // Corre detección de fugas en todos los sensores del usuario
  // y emite WaterLeakDetected si alguno tiene señal de fuga
  runLeakDetection(userId: string): void {
    const sensors = this.repo.findAllSensors(userId);
    sensors.forEach(sensor => {
      if (sensor.hasLeakSignature()) {
        this.eventBus.publish(new WaterLeakDetected(
          sensor.id,
          sensor.name,
          sensor.location,
          sensor.currentFlowLPM,
          userId
        ));
      }
    });
  }
}
