import { ConsumptionSession } from '../aggregates/consumption-session.aggregate';
import { IoTSensor } from '../entities/iot-sensor.entity';
import { ConsumptionReport } from '../aggregates/consumption-session.aggregate';

export abstract class ConsumptionSessionRepository {
  abstract findCurrentByUserId(userId: string): ConsumptionSession | null;
  abstract findAllSensors(userId: string): IoTSensor[];
  abstract findSensorsByUnitId(unitId: string): IoTSensor[];
  abstract addSensor(sensor: IoTSensor): void;
  abstract findReport(userId: string): ConsumptionReport | null;
  abstract saveSensorPreferences(sensor: IoTSensor): void;
}
