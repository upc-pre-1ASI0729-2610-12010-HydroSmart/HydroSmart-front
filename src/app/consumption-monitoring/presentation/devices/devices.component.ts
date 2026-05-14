import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/presentation/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/presentation/components/header/header.component';
import { ConsumptionMonitoringService } from '../../application/services/consumption-monitoring.service';
import { IoTSensor, SensorMonitoringPreferences } from '../../domain/entities/iot-sensor.entity';
import { LowerCasePipe } from '@angular/common';
import { AuthService } from '../../../shared/application/auth.service';
import { TranslationService } from '../../../shared/application/i18n/translation.service';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, FormsModule, LowerCasePipe],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-header [title]="i18n.t('devices.title')" [subtitle]="i18n.t('devices.subtitle')" />

        <div class="page-body">
          <!-- Device Table -->
          <div class="card">
            <div class="table-header">
              <h3>{{ i18n.t('devices.myDevices') }}</h3>
              <div class="table-actions">
                <span class="total-badge">{{ devices().length }} {{ i18n.t('devices.myDevices') | lowercase }}</span>
              </div>
            </div>

            <table class="devices-table">
              <thead>
                <tr>
                  <th>{{ i18n.t('devices.device') }}</th>
                  <th>{{ i18n.t('devices.status') }}</th>
                  <th>{{ i18n.t('devices.lastActivity') }}</th>
                  <th>{{ i18n.t('devices.alertHistory') }}</th>
                  <th>{{ i18n.t('devices.currentFlow') }}</th>
                  <th>{{ i18n.t('devices.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (sensor of devices(); track sensor.id) {
                  <tr [class.row-warning]="sensor.status === 'warning'">
                    <td>
                      <div class="device-name-cell">
                        <div class="device-icon-sm">
                          <span class="material-icon">{{ getDeviceIcon(sensor) }}</span>
                        </div>
                        <div>
                          <div class="device-name">{{ sensor.name }}</div>
                          <div class="device-loc">{{ sensor.location }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" [class]="'st-' + sensor.status">
                        <span class="status-dot"></span>
                        {{ getStatusLabel(sensor.status) }}
                      </span>
                    </td>
                    <td class="cell-muted">{{ formatDate(sensor.lastActiveAt) }}</td>
                    <td>
                      @if (sensor.unresolvedAlertCount > 0) {
                        <span class="alert-count danger">{{ sensor.unresolvedAlertCount }} {{ sensor.unresolvedAlertCount > 1 ? i18n.t('devices.alerts') : i18n.t('devices.alert') }}</span>
                      } @else {
                        <span class="alert-count ok">{{ i18n.t('devices.noAlerts') }}</span>
                      }
                    </td>
                    <td class="cell-flow">{{ sensor.currentFlowLPM }} L/min</td>
                    <td>
                      <div class="row-actions">
                        <button class="action-btn" (click)="openPreferences(sensor)" [title]="i18n.t('devices.preferences')">
                          <span class="material-icon">settings</span>
                        </button>
                        <button class="action-btn"
                          [class.danger-btn]="sensor.status === 'active'"
                          (click)="toggleDevice(sensor)"
                          [title]="sensor.status === 'active' ? i18n.t('devices.deactivate') : i18n.t('devices.activate')">
                          <span class="material-icon">{{ sensor.status === 'active' ? 'toggle_on' : 'toggle_off' }}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Preferences Modal -->
          @if (selectedDevice()) {
            <div class="modal-overlay" (click)="closePreferences()">
              <div class="modal-card" (click)="$event.stopPropagation()">
                <div class="modal-header">
                  <div>
                    <h3>{{ i18n.t('devices.monitoringPrefs') }}</h3>
                    <span class="modal-sub">{{ selectedDevice()!.name }} — {{ selectedDevice()!.location }}</span>
                  </div>
                  <button class="close-btn" (click)="closePreferences()">
                    <span class="material-icon">close</span>
                  </button>
                </div>

                <div class="prefs-grid">
                  <div class="pref-group">
                    <h4>{{ i18n.t('devices.detection') }}</h4>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.detectLeaks" />
                      <span>{{ i18n.t('devices.detectLeaks') }}</span>
                    </label>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.alertOnHighPressure" />
                      <span>{{ i18n.t('devices.alertHighPressure') }}</span>
                    </label>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.sendAlertsOnAnomaly" />
                      <span>{{ i18n.t('devices.alertAnomaly') }}</span>
                    </label>
                  </div>

                  <div class="pref-group">
                    <h4>{{ i18n.t('devices.tracking') }}</h4>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.trackDailyConsumption" />
                      <span>{{ i18n.t('devices.trackDaily') }}</span>
                    </label>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.trackMonthlyConsumption" />
                      <span>{{ i18n.t('devices.trackMonthly') }}</span>
                    </label>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.enableEnergyTracking" />
                      <span>{{ i18n.t('devices.energyTracking') }}</span>
                    </label>
                  </div>

                  <div class="pref-group">
                    <h4>{{ i18n.t('devices.reports') }}</h4>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.sendWeeklyReports" />
                      <span>{{ i18n.t('devices.weeklyReport') }}</span>
                    </label>
                    <label class="pref-row">
                      <input type="checkbox" [(ngModel)]="editPrefs.sendMonthlyReports" />
                      <span>{{ i18n.t('devices.monthlyReport') }}</span>
                    </label>
                  </div>
                </div>

                <div class="modal-footer">
                  <button class="btn-cancel" (click)="closePreferences()">{{ i18n.t('devices.cancel') }}</button>
                  <button class="btn-save" (click)="savePreferences()">{{ i18n.t('devices.savePrefs') }}</button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    .main-content { margin-left: 240px; flex: 1; background: var(--color-bg); }
    .page-body { padding: 24px 28px; }

    .card {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .table-header h3 { font-size: 16px; font-weight: 700; color: var(--color-primary); }
    .total-badge {
      font-size: 12px;
      color: var(--color-dark-grey);
      background: var(--color-bg);
      padding: 4px 12px;
      border-radius: 20px;
    }

    .devices-table {
      width: 100%;
      border-collapse: collapse;
    }
    .devices-table th {
      text-align: left;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-dark-grey);
      border-bottom: 1px solid var(--color-border);
      white-space: nowrap;
    }
    .devices-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--color-border);
      font-size: 13px;
      color: var(--color-primary);
      vertical-align: middle;
    }
    .devices-table tr:last-child td { border-bottom: none; }
    .devices-table tr.row-warning { background: #FFFBF0; }

    .device-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .device-icon-sm {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--color-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; font-size: 20px; }
    .device-name { font-weight: 600; font-size: 13px; }
    .device-loc { font-size: 12px; color: var(--color-dark-grey); }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .st-active { background: #E8F7F1; color: var(--color-accent); }
    .st-warning { background: #FEF6E8; color: var(--color-warning); }
    .st-inactive { background: var(--color-bg); color: var(--color-dark-grey); }
    .st-error { background: #FDECEA; color: var(--color-danger); }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }

    .cell-muted { color: var(--color-dark-grey); }
    .cell-flow { color: var(--color-teal); font-weight: 500; }

    .alert-count {
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 20px;
    }
    .alert-count.danger { background: #FDECEA; color: var(--color-danger); }
    .alert-count.ok { background: #E8F7F1; color: var(--color-accent); }

    .row-actions { display: flex; gap: 6px; }
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--color-bg);
      color: var(--color-dark-grey);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .action-btn:hover { background: #EBF3FD; color: #2980B9; }
    .action-btn.danger-btn:hover { background: #FDECEA; color: var(--color-danger); }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3,22,53,0.5);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-card {
      background: var(--color-white);
      border-radius: 16px;
      padding: 28px;
      width: 560px;
      max-width: 90vw;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .modal-header h3 { font-size: 16px; font-weight: 700; color: var(--color-primary); }
    .modal-sub { font-size: 13px; color: var(--color-dark-grey); }
    .close-btn {
      width: 32px;
      height: 32px;
      background: var(--color-bg);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-dark-grey);
    }
    .close-btn:hover { color: var(--color-danger); background: #FDECEA; }

    .prefs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .pref-group { display: flex; flex-direction: column; gap: 10px; }
    .pref-group h4 {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .pref-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      color: var(--color-dark-grey);
      line-height: 1.4;
    }
    .pref-row input[type="checkbox"] {
      margin-top: 2px;
      width: 15px;
      height: 15px;
      cursor: pointer;
      accent-color: var(--color-accent);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
    }
    .btn-cancel {
      padding: 10px 20px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-family);
      color: var(--color-dark-grey);
      background: transparent;
    }
    .btn-save {
      padding: 10px 24px;
      background: var(--color-accent);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-family);
      font-weight: 600;
    }
    .btn-save:hover { background: #3da374; }
  `]
})
export class DevicesComponent implements OnInit {
  private monitoringSvc = inject(ConsumptionMonitoringService);
  private authSvc = inject(AuthService);
  i18n = inject(TranslationService);

  devices = this.monitoringSvc.sensors;
  selectedDevice = signal<IoTSensor | null>(null);
  editPrefs: SensorMonitoringPreferences = {} as SensorMonitoringPreferences;

  ngOnInit(): void {
    this.monitoringSvc.initialize(this.authSvc.currentUser()?.id ?? 'usr-001');
  }

  getStatusLabel(status: string): string {
    const keyMap: Record<string, string> = {
      active: 'devices.active', warning: 'devices.warning', inactive: 'devices.inactive', error: 'devices.error'
    };
    return this.i18n.t(keyMap[status] ?? status);
  }

  getDeviceIcon(sensor: IoTSensor): string {
    const icons: Record<string, string> = {
      'smart-meter': 'speed',
      'flow-sensor': 'water',
      'leak-detector': 'water_damage',
      'pressure-sensor': 'compress'
    };
    return icons[sensor.type] ?? 'sensors';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  toggleDevice(sensor: IoTSensor): void {
    this.monitoringSvc.toggleSensor(sensor.id);
  }

  openPreferences(sensor: IoTSensor): void {
    this.selectedDevice.set(sensor);
    this.editPrefs = { ...sensor.preferences };
  }

  closePreferences(): void {
    this.selectedDevice.set(null);
  }

  savePreferences(): void {
    const sensor = this.selectedDevice();
    if (sensor) {
      this.monitoringSvc.updateSensorPreferences(sensor.id, this.editPrefs);
    }
    this.closePreferences();
  }
}
