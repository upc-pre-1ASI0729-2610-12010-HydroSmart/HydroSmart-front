import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Consumption Monitoring BC
import { ConsumptionSessionRepository } from './consumption-monitoring/domain/repositories/consumption-session.repository';
import { MockConsumptionSessionRepository } from './consumption-monitoring/infrastructure/repositories/mock-consumption-session.repository';
import { GetConsumptionSummaryUseCase } from './consumption-monitoring/application/use-cases/get-consumption-summary.use-case';
import { GetConsumptionReportUseCase } from './consumption-monitoring/application/use-cases/get-consumption-report.use-case';
import { DetectAnomalyUseCase } from './consumption-monitoring/application/use-cases/detect-anomaly.use-case';
import { ManageSensorUseCase } from './consumption-monitoring/application/use-cases/manage-sensor.use-case';
import { ConsumptionMonitoringService } from './consumption-monitoring/application/services/consumption-monitoring.service';

// Incident Detection BC
import { WaterIncidentRepository } from './incident-detection/domain/repositories/water-incident.repository';
import { MockWaterIncidentRepository } from './incident-detection/infrastructure/repositories/mock-water-incident.repository';
import { OpenIncidentUseCase } from './incident-detection/application/use-cases/open-incident.use-case';
import { ResolveIncidentUseCase } from './incident-detection/application/use-cases/resolve-incident.use-case';
import { EscalateIncidentUseCase } from './incident-detection/application/use-cases/escalate-incident.use-case';
import { IncidentDetectionService } from './incident-detection/application/services/incident-detection.service';

// Savings Optimization BC
import { SavingGoalRepository } from './savings-optimization/domain/repositories/saving-goal.repository';
import { MockSavingGoalRepository } from './savings-optimization/infrastructure/repositories/mock-saving-goal.repository';
import { EvaluateGoalProgressUseCase } from './savings-optimization/application/use-cases/evaluate-goal-progress.use-case';
import { AdjustRecommendationUseCase } from './savings-optimization/application/use-cases/adjust-recommendation.use-case';
import { CalculateProjectedSavingsUseCase } from './savings-optimization/application/use-cases/calculate-projected-savings.use-case';
import { SavingsOptimizationService } from './savings-optimization/application/services/savings-optimization.service';

// Rental Management BC
import { RentalRepository } from './rental-management/domain/repositories/rental.repository';
import { MockRentalRepository } from './rental-management/infrastructure/repositories/mock-rental.repository';
import { CheckTenantConsumptionUseCase } from './rental-management/application/use-cases/check-tenant-consumption.use-case';
import { GenerateConsumptionPenaltyUseCase } from './rental-management/application/use-cases/generate-consumption-penalty.use-case';
import { RentalManagementService } from './rental-management/application/services/rental-management.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Consumption Monitoring BC — repositories + use cases + service
    { provide: ConsumptionSessionRepository, useClass: MockConsumptionSessionRepository },
    GetConsumptionSummaryUseCase,
    GetConsumptionReportUseCase,
    DetectAnomalyUseCase,
    ManageSensorUseCase,
    ConsumptionMonitoringService,

    // Incident Detection BC — repositories + use cases + service
    { provide: WaterIncidentRepository, useClass: MockWaterIncidentRepository },
    OpenIncidentUseCase,
    ResolveIncidentUseCase,
    EscalateIncidentUseCase,
    IncidentDetectionService,

    // Savings Optimization BC — repositories + use cases + service
    { provide: SavingGoalRepository, useClass: MockSavingGoalRepository },
    EvaluateGoalProgressUseCase,
    AdjustRecommendationUseCase,
    CalculateProjectedSavingsUseCase,
    SavingsOptimizationService,

    // Rental Management BC — repositories + use cases + service
    { provide: RentalRepository, useClass: MockRentalRepository },
    CheckTenantConsumptionUseCase,
    GenerateConsumptionPenaltyUseCase,
    RentalManagementService,
  ],
};
