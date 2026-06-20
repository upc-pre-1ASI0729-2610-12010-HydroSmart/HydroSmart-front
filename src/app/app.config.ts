import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// HTTP infra
import { authInterceptor } from './shared/infrastructure/http/auth.interceptor';

// Consumption Monitoring BC
import { ConsumptionSessionRepository } from './consumption-monitoring/domain/repositories/consumption-session.repository';
import { HttpConsumptionSessionRepository } from './consumption-monitoring/infrastructure/repositories/http-consumption-session.repository';
import { GetConsumptionSummaryUseCase } from './consumption-monitoring/application/use-cases/get-consumption-summary.use-case';
import { GetConsumptionReportUseCase } from './consumption-monitoring/application/use-cases/get-consumption-report.use-case';
import { DetectAnomalyUseCase } from './consumption-monitoring/application/use-cases/detect-anomaly.use-case';
import { ManageSensorUseCase } from './consumption-monitoring/application/use-cases/manage-sensor.use-case';
import { ConsumptionMonitoringService } from './consumption-monitoring/application/services/consumption-monitoring.service';

// Incident Detection BC
import { WaterIncidentRepository } from './incident-detection/domain/repositories/water-incident.repository';
import { HttpWaterIncidentRepository } from './incident-detection/infrastructure/repositories/http-water-incident.repository';
import { OpenIncidentUseCase } from './incident-detection/application/use-cases/open-incident.use-case';
import { ResolveIncidentUseCase } from './incident-detection/application/use-cases/resolve-incident.use-case';
import { EscalateIncidentUseCase } from './incident-detection/application/use-cases/escalate-incident.use-case';
import { IncidentDetectionService } from './incident-detection/application/services/incident-detection.service';

// Savings Optimization BC
import { SavingGoalRepository } from './savings-optimization/domain/repositories/saving-goal.repository';
import { HttpSavingGoalRepository } from './savings-optimization/infrastructure/repositories/http-saving-goal.repository';
import { EvaluateGoalProgressUseCase } from './savings-optimization/application/use-cases/evaluate-goal-progress.use-case';
import { AdjustRecommendationUseCase } from './savings-optimization/application/use-cases/adjust-recommendation.use-case';
import { CalculateProjectedSavingsUseCase } from './savings-optimization/application/use-cases/calculate-projected-savings.use-case';
import { SavingsOptimizationService } from './savings-optimization/application/services/savings-optimization.service';

// Property Management BC (sigue en Mock, no es crítico para esta fase)
import { PropertyManagementRepository } from './property-management/domain/repositories/property-management.repository';
import { MockPropertyManagementRepository } from './property-management/infrastructure/repositories/mock-property-management.repository';
import { CheckTenantConsumptionUseCase } from './property-management/application/use-cases/check-tenant-consumption.use-case';
import { GenerateConsumptionPenaltyUseCase } from './property-management/application/use-cases/generate-consumption-penalty.use-case';
import { PropertyManagementService } from './property-management/application/services/property-management.service';

// i18n
import { provideI18n } from './shared/application/i18n/i18n.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    // Consumption Monitoring BC
    { provide: ConsumptionSessionRepository, useClass: HttpConsumptionSessionRepository },
    GetConsumptionSummaryUseCase,
    GetConsumptionReportUseCase,
    DetectAnomalyUseCase,
    ManageSensorUseCase,
    ConsumptionMonitoringService,

    // Incident Detection BC
    { provide: WaterIncidentRepository, useClass: HttpWaterIncidentRepository },
    OpenIncidentUseCase,
    ResolveIncidentUseCase,
    EscalateIncidentUseCase,
    IncidentDetectionService,

    // Savings Optimization BC
    { provide: SavingGoalRepository, useClass: HttpSavingGoalRepository },
    EvaluateGoalProgressUseCase,
    AdjustRecommendationUseCase,
    CalculateProjectedSavingsUseCase,
    SavingsOptimizationService,

    // Property Management BC
    { provide: PropertyManagementRepository, useClass: MockPropertyManagementRepository },
    CheckTenantConsumptionUseCase,
    GenerateConsumptionPenaltyUseCase,
    PropertyManagementService,

    // i18n
    ...provideI18n(),
  ],
};
