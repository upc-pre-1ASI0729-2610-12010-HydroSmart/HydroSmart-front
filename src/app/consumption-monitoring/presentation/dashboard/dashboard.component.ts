import { Component, inject, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';

import { SidebarComponent } from '../../../shared/presentation/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/presentation/components/header/header.component';
import { AuthService } from '../../../shared/application/auth.service';
import { TranslationService } from '../../../shared/application/i18n/translation.service';
import { BuildingContextService } from '../../../shared/application/building-context.service';
import { ConsumptionMonitoringService } from '../../application/services/consumption-monitoring.service';
import { IncidentDetectionService } from '../../../incident-detection/application/services/incident-detection.service';
import { SavingsOptimizationService } from '../../../savings-optimization/application/services/savings-optimization.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterLink, DecimalPipe],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-header [title]="i18n.t('header.dashboard')" [subtitle]="greeting" />

        <div class="page-body">
          <!-- KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon blue">
                <span class="material-icon">water_drop</span>
              </div>
              <div class="kpi-data">
                <span class="kpi-value">{{ summary?.totalVolumeLiters | number:'1.0-0' }} L</span>
                <span class="kpi-label">{{ i18n.t('dashboard.monthlyConsumption') }}</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon" [class.green]="(summary?.variationPercent ?? 0) <= 0" [class.red]="(summary?.variationPercent ?? 0) > 0">
                <span class="material-icon">{{ (summary?.variationPercent ?? 0) <= 0 ? 'trending_down' : 'trending_up' }}</span>
              </div>
              <div class="kpi-data">
                <span class="kpi-value"
                  [class.text-accent]="(summary?.variationPercent ?? 0) <= 0"
                  [class.text-danger]="(summary?.variationPercent ?? 0) > 0">
                  {{ (summary?.variationPercent ?? 0) > 0 ? '+' : '' }}{{ summary?.variationPercent | number:'1.0-1' }}%
                </span>
                <span class="kpi-label">{{ i18n.t('dashboard.vsLastMonth') }}</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon teal">
                <span class="material-icon">sensors</span>
              </div>
              <div class="kpi-data">
                <span class="kpi-value">{{ monitoringSvc.activeDeviceCount() }}</span>
                <span class="kpi-label">{{ i18n.t('dashboard.activeDevices') }}</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon orange">
                <span class="material-icon">payments</span>
              </div>
              <div class="kpi-data">
                <span class="kpi-value">S/. {{ summary?.estimatedCostPEN | number:'1.2-2' }}</span>
                <span class="kpi-label">{{ i18n.t('dashboard.estimatedCost') }}</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon green">
                <span class="material-icon">today</span>
              </div>
              <div class="kpi-data">
                <span class="kpi-value">{{ summary?.currentDayVolumeLiters }} L</span>
                <span class="kpi-label">{{ i18n.t('dashboard.todayConsumption') }}</span>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="charts-row">
            <div class="chart-card wide">
              <div class="chart-header">
                <h3>{{ i18n.t('dashboard.dailyConsumption') }}</h3>
                <span class="chart-period">{{ i18n.t('dashboard.may2025') }}</span>
              </div>
              <div class="chart-wrap"><canvas #lineChart></canvas></div>
            </div>

            <div class="chart-card">
              <div class="chart-header"><h3>{{ i18n.t('dashboard.byCategory') }}</h3></div>
              <div class="chart-wrap donut-wrap"><canvas #donutChart></canvas></div>
              <div class="donut-legend">
                @for (item of categoryLegend; track item.label) {
                  <div class="legend-item">
                    <span class="legend-dot" [style.background]="item.color"></span>
                    <span>{{ i18n.t(item.label) }}</span>
                    <span class="legend-pct">{{ item.pct }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="bottom-row">
            <div class="card alerts-card">
              <div class="section-header">
                <h3>{{ i18n.t('dashboard.activeAlerts') }}</h3>
                @if (incidentSvc.unresolvedCount() > 0) {
                  <span class="badge-danger">{{ incidentSvc.unresolvedCount() }}</span>
                }
              </div>
              @for (incident of incidentSvc.activeIncidents().slice(0, 3); track incident.id) {
                <div class="alert-item" [class]="'sev-' + incident.severity">
                  <div class="alert-sev-bar"></div>
                  <div class="alert-body">
                    <div class="alert-title">{{ incident.title }}</div>
                    <div class="alert-msg">{{ incident.message }}</div>
                  </div>
                </div>
              } @empty {
                <div class="empty-alerts">
                  <span class="material-icon">check_circle</span>
                  <p>{{ i18n.t('dashboard.noActiveAlerts') }}</p>
                </div>
              }
            </div>

            <div class="card goal-card">
              <div class="section-header">
                <h3>{{ i18n.t('dashboard.savingGoal') }}</h3>
                @if (savingsSvc.activeGoal()) {
                  <span [class]="savingsSvc.activeGoal()!.isAchieved ? 'badge-success' : 'badge-warning'">
                    {{ savingsSvc.activeGoal()!.isAchieved ? i18n.t('dashboard.onTarget') : i18n.t('dashboard.atRisk') }}
                  </span>
                }
              </div>
              @if (savingsSvc.activeGoal(); as goal) {
                <div class="goal-info">
                  <div class="goal-row">
                    <span>{{ i18n.t('dashboard.objective') }}</span>
                    <strong>{{ goal.savingTarget.targetVolume.liters | number }} L</strong>
                  </div>
                  <div class="goal-row">
                    <span>{{ i18n.t('dashboard.currentConsumption') }}</span>
                    <strong [class.text-danger]="!goal.isAchieved">{{ goal.currentVolume.liters | number }} L</strong>
                  </div>
                  <div class="goal-row">
                    <span>{{ i18n.t('dashboard.budget') }}</span>
                    <strong>S/. {{ goal.monthlyBudget.amount | number:'1.2-2' }}</strong>
                  </div>
                  <div class="progress-bar-wrap">
                    <div class="progress-label">
                      <span>{{ i18n.t('dashboard.savingsAchieved') }}</span>
                      <span>{{ goal.progressPercent }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill"
                        [style.width.%]="goal.progressPercent"
                        [class.over]="!goal.isAchieved">
                      </div>
                    </div>
                  </div>
                  <div class="goal-recs">
                    <p class="recs-title">{{ i18n.t('dashboard.recommendations') }}:</p>
                    @for (rec of goal.recommendations.slice(0, 2); track $index) {
                      <div class="rec-item">
                        <span class="material-icon">tips_and_updates</span>
                        <span>{{ rec }}</span>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <p class="no-goal">{{ i18n.t('dashboard.noActiveGoal') }}</p>
              }
            </div>

            <div class="card devices-card">
              <div class="section-header">
                <h3>{{ i18n.t('dashboard.myDevices') }}</h3>
                <a routerLink="/devices" class="view-all">{{ i18n.t('dashboard.viewAll') }}</a>
              </div>
              @for (sensor of monitoringSvc.sensors().slice(0, 3); track sensor.id) {
                <div class="device-row">
                  <div class="device-status-dot" [class]="sensor.status"></div>
                  <div class="device-info">
                    <span class="device-name">{{ sensor.name }}</span>
                    <span class="device-loc">{{ sensor.location }}</span>
                  </div>
                  <div class="device-flow">{{ sensor.currentFlowLPM }} L/min</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;

  protected readonly monitoringSvc = inject(ConsumptionMonitoringService);
  protected readonly incidentSvc = inject(IncidentDetectionService);
  protected readonly savingsSvc = inject(SavingsOptimizationService);
  private readonly authSvc = inject(AuthService);
  private readonly buildingCtx = inject(BuildingContextService);
  i18n = inject(TranslationService);

  private lineChartInstance?: Chart;
  private donutChartInstance?: Chart;
  chartsReady = false;

  get summary() { return this.monitoringSvc.summary(); }

  get greeting(): string {
    const h = new Date().getHours();
    const name = this.authSvc.currentUser()?.name ?? '';
    if (h < 12) return `${this.i18n.t('greeting.morning')}, ${name}`;
    if (h < 18) return `${this.i18n.t('greeting.afternoon')}, ${name}`;
    return `${this.i18n.t('greeting.evening')}, ${name}`;
  }

  categoryLegend = [
    { label: 'category.bathroom', color: '#4AB787', pct: 40 },
    { label: 'category.kitchen', color: '#23707D', pct: 30 },
    { label: 'category.garden', color: '#F39C12', pct: 20 },
    { label: 'category.laundry', color: '#B7B7B7', pct: 10 }
  ];

  constructor() {
    // Reactivo al selector de unidad del header (solo admin)
    effect(async () => {
      const selectedUnitId = this.buildingCtx.selectedUnitId();
      const role = this.authSvc.currentUser()?.role;
      if (role !== 'BUILDING_ADMIN') return;
      if (selectedUnitId) {
        const unit = this.buildingCtx.units.find(u => u.id === selectedUnitId);
        await this.monitoringSvc.initializeForUnit('usr-001', selectedUnitId, unit?.currentConsumptionLiters ?? 0);
      } else {
        await this.monitoringSvc.initializeForUnit('usr-001', null, 0);
      }
    });

    // Actualiza el gráfico cuando cambia el summary (Pedido 4-B)
    effect(() => {
      const s = this.monitoringSvc.summary();
      if (!s || !this.chartsReady) return;
      if (this.lineChartInstance) {
        this.lineChartInstance.data.labels = s.dailyLabels;
        this.lineChartInstance.data.datasets[0].data = s.dailyValues;
        this.lineChartInstance.update();
      }
    });
  }

  ngOnInit(): void {
    const user = this.authSvc.currentUser();
    const userId = user?.id ?? 'usr-001';
    const role = user?.role;

    if (role === 'BUILDING_ADMIN') {
      this.monitoringSvc.initialize('usr-001');
      this.incidentSvc.initialize('usr-001');
      this.savingsSvc.initialize('usr-001');
    } else {
      const unit = this.buildingCtx.getUnitForTenant(userId);
      if (unit) {
        this.monitoringSvc.initializeForUnit('usr-001', unit.id, unit.currentConsumptionLiters);
      } else {
        this.monitoringSvc.initialize('usr-001');
      }
      this.incidentSvc.initialize(userId);
      this.savingsSvc.initialize(userId);
    }

    const totalLiters = this.monitoringSvc.summary()?.totalVolumeLiters ?? 0;
    this.savingsSvc.evaluateWithCurrentConsumption(totalLiters);
  }

  ngAfterViewInit(): void {
    this.buildLineChart();
    this.buildDonutChart();
    this.chartsReady = true;
  }

  ngOnDestroy(): void {
    this.lineChartInstance?.destroy();
    this.donutChartInstance?.destroy();
  }

  private buildLineChart(): void {
    const s = this.monitoringSvc.summary();
    this.lineChartInstance = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: s?.dailyLabels ?? [],
        datasets: [{
          label: 'Litros', data: s?.dailyValues ?? [],
          borderColor: '#4AB787', backgroundColor: 'rgba(74,183,135,0.12)',
          borderWidth: 2.5, pointBackgroundColor: '#4AB787',
          pointRadius: 4, fill: true, tension: 0.4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Hind', size: 11 }, color: '#666' } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true, ticks: { font: { family: 'Hind', size: 11 }, color: '#666' } }
        }
      }
    });
  }

  private buildDonutChart(): void {
    this.donutChartInstance = new Chart(this.donutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [this.i18n.t('category.bathroom'), this.i18n.t('category.kitchen'), this.i18n.t('category.garden'), this.i18n.t('category.laundry')],
        datasets: [{ data: [40, 30, 20, 10], backgroundColor: ['#4AB787', '#23707D', '#F39C12', '#B7B7B7'], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
  }
}
