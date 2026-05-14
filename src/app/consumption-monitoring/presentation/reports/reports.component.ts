import {
  Component, inject, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from '../../../shared/presentation/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/presentation/components/header/header.component';
import { ConsumptionMonitoringService } from '../../application/services/consumption-monitoring.service';
import { AuthService } from '../../../shared/application/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, FormsModule, DecimalPipe],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-header title="Reportes" subtitle="Análisis de consumo hídrico" />

        <div class="page-body">
          <!-- Summary row -->
          <div class="summary-row">
            <div class="summary-item">
              <span class="s-label">Total del período</span>
              <span class="s-value">{{ report?.totalVolumeLiters | number }} L</span>
            </div>
            <div class="summary-item">
              <span class="s-label">Promedio diario</span>
              <span class="s-value">{{ report?.averageDailyVolumeLiters | number:'1.0-0' }} L/día</span>
            </div>
            <div class="summary-item">
              <span class="s-label">Costo estimado</span>
              <span class="s-value">S/. {{ report?.estimatedCostPEN | number:'1.2-2' }}</span>
            </div>
            <div class="summary-item">
              <span class="s-label">Día pico</span>
              <span class="s-value">{{ report?.peakDay ? formatPeakDay(report!.peakDay) : '—' }}</span>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="charts-row">
            <div class="chart-card">
              <h3>Ranking de Dispositivos</h3>
              <div class="chart-wrap">
                <canvas #rankingChart></canvas>
              </div>
              <div class="ranking-list">
                @for (device of report?.deviceRanking ?? []; track device.deviceId) {
                  <div class="ranking-row">
                    <span class="rank-num">#{{ device.rank }}</span>
                    <div class="rank-bar-wrap">
                      <span class="rank-name">{{ device.deviceName }}</span>
                      <div class="rank-bar">
                        <div class="rank-fill" [style.width.%]="device.percentage"></div>
                      </div>
                    </div>
                    <div class="rank-right">
                      <span class="rank-vol">{{ device.volumeLiters | number }} L</span>
                      <span class="rank-pct">{{ device.percentage }}%</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="chart-card">
              <h3>Promedio de Consumo Semanal</h3>
              <div class="chart-wrap">
                <canvas #weeklyChart></canvas>
              </div>
            </div>
          </div>

          <!-- Export Card -->
          <div class="card export-card">
            <h3>Exportar Reporte</h3>
            <div class="export-form">
              <div class="form-group">
                <label>Período</label>
                <select [(ngModel)]="exportPeriod">
                  <option value="current">Mayo 2025 (actual)</option>
                  <option value="last">Abril 2025</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div class="form-group">
                <label>Formato</label>
                <select [(ngModel)]="exportFormat">
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div class="form-group">
                <label>Incluir</label>
                <div class="checkbox-group">
                  <label class="chk-row">
                    <input type="checkbox" [(ngModel)]="includeCharts" />
                    <span>Gráficos</span>
                  </label>
                  <label class="chk-row">
                    <input type="checkbox" [(ngModel)]="includeAlerts" />
                    <span>Alertas</span>
                  </label>
                  <label class="chk-row">
                    <input type="checkbox" [(ngModel)]="includeRecs" />
                    <span>Recomendaciones</span>
                  </label>
                </div>
              </div>
              <button class="btn-export" (click)="exportReport()">
                <span class="material-icon">download</span>
                Generar reporte
              </button>
            </div>
            @if (exportMsg) {
              <div class="export-msg">{{ exportMsg }}</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    .main-content { margin-left: 240px; flex: 1; background: var(--color-bg); }
    .page-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 24px; }

    .summary-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .summary-item {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: var(--shadow-sm);
    }
    .s-label { font-size: 12px; color: var(--color-dark-grey); }
    .s-value { font-size: 22px; font-weight: 700; color: var(--color-primary); }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .chart-card {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .chart-card h3 { font-size: 15px; font-weight: 700; color: var(--color-primary); margin-bottom: 16px; }
    .chart-wrap { height: 200px; position: relative; margin-bottom: 16px; }

    .ranking-list { display: flex; flex-direction: column; gap: 12px; }
    .ranking-row { display: flex; align-items: center; gap: 10px; }
    .rank-num { font-size: 13px; font-weight: 700; color: var(--color-light-grey); width: 22px; }
    .rank-bar-wrap { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .rank-name { font-size: 12px; font-weight: 500; color: var(--color-primary); }
    .rank-bar { height: 6px; background: var(--color-border); border-radius: 3px; }
    .rank-fill { height: 100%; background: var(--color-accent); border-radius: 3px; }
    .rank-right { display: flex; flex-direction: column; align-items: flex-end; width: 60px; }
    .rank-vol { font-size: 12px; font-weight: 600; color: var(--color-primary); }
    .rank-pct { font-size: 11px; color: var(--color-dark-grey); }

    .card { background: var(--color-white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); }
    .export-card h3 { font-size: 15px; font-weight: 700; color: var(--color-primary); margin-bottom: 20px; }
    .export-form { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 12px; font-weight: 600; color: var(--color-primary); }
    select, input[type="text"] {
      padding: 9px 12px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 13px;
      font-family: var(--font-family);
      color: var(--color-primary);
      background: var(--color-white);
      min-width: 160px;
    }
    select:focus { outline: none; border-color: var(--color-accent); }
    .checkbox-group { display: flex; gap: 16px; padding: 6px 0; }
    .chk-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--color-dark-grey);
      cursor: pointer;
    }
    .chk-row input[type="checkbox"] { accent-color: var(--color-accent); width: 14px; height: 14px; }
    .btn-export {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--color-primary);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-family);
      font-weight: 600;
      transition: background 0.15s;
    }
    .btn-export:hover { background: #0a2850; }
    .btn-export .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; font-size: 18px; }
    .export-msg { margin-top: 12px; font-size: 13px; color: var(--color-accent); }
    .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rankingChart') rankingChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef<HTMLCanvasElement>;

  private monitoringSvc = inject(ConsumptionMonitoringService);
  private authSvc = inject(AuthService);

  private rankingChartInst?: Chart;
  private weeklyChartInst?: Chart;

  get report() { return this.monitoringSvc.report(); }

  ngOnInit(): void {
    this.monitoringSvc.initialize(this.authSvc.currentUser()?.id ?? 'usr-001');
  }

  exportPeriod = 'current';
  exportFormat = 'pdf';
  includeCharts = true;
  includeAlerts = true;
  includeRecs = false;
  exportMsg = '';

  formatPeakDay(dateStr: string): string {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long' }).format(new Date(dateStr));
  }

  exportReport(): void {
    this.exportMsg = `Generando reporte ${this.exportFormat.toUpperCase()} para ${this.exportPeriod === 'current' ? 'Mayo 2025' : 'Abril 2025'}...`;
    setTimeout(() => {
      this.exportMsg = `¡Reporte ${this.exportFormat.toUpperCase()} generado exitosamente!`;
      setTimeout(() => { this.exportMsg = ''; }, 3000);
    }, 1200);
  }

  ngAfterViewInit(): void {
    this.buildRankingChart();
    this.buildWeeklyChart();
  }

  ngOnDestroy(): void {
    this.rankingChartInst?.destroy();
    this.weeklyChartInst?.destroy();
  }

  private buildRankingChart(): void {
    const r = this.report;
    this.rankingChartInst = new Chart(this.rankingChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: r?.deviceRanking.map(d => d.deviceName) ?? [],
        datasets: [{
          label: 'Litros',
          data: r?.deviceRanking.map(d => d.volumeLiters) ?? [],
          backgroundColor: ['#4AB787', '#23707D', '#F39C12'],
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Hind', size: 11 }, color: '#666' } },
          y: { grid: { display: false }, ticks: { font: { family: 'Hind', size: 11 }, color: '#666' } }
        }
      }
    });
  }

  private buildWeeklyChart(): void {
    const r = this.report;
    this.weeklyChartInst = new Chart(this.weeklyChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: r?.weeklyAverages.map(w => w.week) ?? [],
        datasets: [{
          label: 'L/día promedio',
          data: r?.weeklyAverages.map(w => w.averageLiters) ?? [],
          backgroundColor: '#4AB787',
          borderRadius: 6,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Hind', size: 11 }, color: '#666' } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true, ticks: { font: { family: 'Hind', size: 11 }, color: '#666' } }
        }
      }
    });
  }
}
