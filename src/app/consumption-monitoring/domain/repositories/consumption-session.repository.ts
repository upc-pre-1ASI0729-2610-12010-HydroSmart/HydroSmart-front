/**
 * Consumption Monitoring — ConsumptionSession Repository (abstract)
 *
 * Pertenece a: consumption-monitoring/domain/repositories
 * Por qué domain: la interfaz del repositorio pertenece al dominio para
 * que el dominio defina el contrato de acceso a datos — el dominio no
 * depende de la infraestructura, sino al revés (Dependency Inversion).
 *
 * La clase abstracta en Angular actúa como token de inyección, lo que
 * permite que infrastructure provea la implementación concreta.
 */
import { ConsumptionSession } from '../aggregates/consumption-session.aggregate';
import { IoTSensor } from '../entities/iot-sensor.entity';
import { ConsumptionReport } from '../aggregates/consumption-session.aggregate';

export abstract class ConsumptionSessionRepository {
  abstract findCurrentByUserId(userId: string): ConsumptionSession | null;
  abstract findAllSensors(userId: string): IoTSensor[];
  abstract findReport(userId: string): ConsumptionReport | null;
  abstract saveSensorPreferences(sensor: IoTSensor): void;
}
