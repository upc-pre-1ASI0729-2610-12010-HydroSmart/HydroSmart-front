import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/presentation/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/presentation/components/header/header.component';
import { NotificationService } from '../../../shared/application/notification.service';
import { TranslationService } from '../../../shared/application/i18n/translation.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, FormsModule],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-header [title]="i18n.t('settings.title')" [subtitle]="i18n.t('settings.subtitle')" />

        <div class="page-body">
          <div class="settings-grid">
            <!-- Saving Mode -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon green">eco</span>
                <div>
                  <h3>{{ i18n.t('settings.savingMode') }}</h3>
                  <p>{{ i18n.t('settings.savingModeDesc') }}</p>
                </div>
              </div>
              <div class="toggle-list">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.savingActive') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.savingActiveDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="savingMode" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.autoCutoff') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.autoCutoffDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="autoCutoff" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.irrigationOpt') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.irrigationOptDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="irrigationOpt" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon blue">notifications_active</span>
                <div>
                  <h3>{{ i18n.t('settings.notifAlerts') }}</h3>
                  <p>{{ i18n.t('settings.notifAlertsDesc') }}</p>
                </div>
              </div>
              <div class="toggle-list">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.pushNotif') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.pushNotifDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.enablePushNotifications"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.leakAlert') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.leakAlertDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.alertOnLeak"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.anomalyAlert') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.anomalyAlertDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.alertOnAnomaly"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.thresholdAlert') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.thresholdAlertDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.alertOnThresholdExceeded"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Reports -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon teal">bar_chart</span>
                <div>
                  <h3>{{ i18n.t('settings.customReports') }}</h3>
                  <p>{{ i18n.t('settings.customReportsDesc') }}</p>
                </div>
              </div>
              <div class="toggle-list">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.weeklyReport') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.weeklyReportDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.weeklyReportEnabled"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">{{ i18n.t('settings.monthlyReport') }}</span>
                    <span class="toggle-desc">{{ i18n.t('settings.monthlyReportDesc') }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.monthlyReportEnabled"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="quiet-hours">
                <span class="toggle-label">{{ i18n.t('settings.quietHours') }}</span>
                <div class="hours-row">
                  <input type="time" [(ngModel)]="notifSettings.quietHoursStart" />
                  <span>{{ i18n.t('settings.to') }}</span>
                  <input type="time" [(ngModel)]="notifSettings.quietHoursEnd" />
                </div>
              </div>
            </div>

            <!-- Help & Support -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon orange">help_outline</span>
                <div>
                  <h3>{{ i18n.t('settings.helpSupport') }}</h3>
                  <p>{{ i18n.t('settings.helpSupportDesc') }}</p>
                </div>
              </div>
              <div class="link-list">
                <button class="link-row">
                  <span class="material-icon">menu_book</span>
                  <span>{{ i18n.t('settings.userGuide') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">support_agent</span>
                  <span>{{ i18n.t('settings.contactSupport') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">video_library</span>
                  <span>{{ i18n.t('settings.videoTutorials') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">bug_report</span>
                  <span>{{ i18n.t('settings.reportProblem') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
              </div>
            </div>

            <!-- Security -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon red">security</span>
                <div>
                  <h3>{{ i18n.t('settings.securityPrivacy') }}</h3>
                  <p>{{ i18n.t('settings.securityDesc') }}</p>
                </div>
              </div>
              <div class="link-list">
                <button class="link-row">
                  <span class="material-icon">lock</span>
                  <span>{{ i18n.t('settings.changePassword') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">devices</span>
                  <span>{{ i18n.t('settings.activeSessions') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">download</span>
                  <span>{{ i18n.t('settings.downloadData') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row danger-link">
                  <span class="material-icon">delete_forever</span>
                  <span>{{ i18n.t('settings.deleteAccount') }}</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          @if (saveConfirm()) {
            <div class="save-toast">
              <span class="material-icon">check_circle</span>
              {{ i18n.t('settings.saved') }}
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    .main-content { margin-left: 240px; flex: 1; background: var(--color-bg); }
    .page-body { padding: 24px 28px; position: relative; }

    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .card {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    .card-section-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border);
    }
    .section-icon {
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
      font-size: 24px;
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .section-icon.green { background: #E8F7F1; color: var(--color-accent); }
    .section-icon.blue { background: #EBF3FD; color: #2980B9; }
    .section-icon.teal { background: #E4F0F1; color: var(--color-teal); }
    .section-icon.orange { background: #FEF6E8; color: var(--color-warning); }
    .section-icon.red { background: #FDECEA; color: var(--color-danger); }
    .card-section-header h3 { font-size: 15px; font-weight: 700; color: var(--color-primary); }
    .card-section-header p { font-size: 12px; color: var(--color-dark-grey); margin-top: 2px; }

    .toggle-list { display: flex; flex-direction: column; }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px solid var(--color-border);
    }
    .toggle-row:last-child { border-bottom: none; }
    .toggle-info { flex: 1; }
    .toggle-label { display: block; font-size: 13px; font-weight: 600; color: var(--color-primary); }
    .toggle-desc { display: block; font-size: 12px; color: var(--color-dark-grey); margin-top: 2px; line-height: 1.4; }

    .toggle-switch {
      position: relative;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
      cursor: pointer;
    }
    .toggle-switch input { display: none; }
    .slider {
      position: absolute;
      inset: 0;
      background: var(--color-border);
      border-radius: 12px;
      transition: background 0.2s;
    }
    .slider::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      background: white;
      border-radius: 50%;
      top: 3px;
      left: 3px;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle-switch input:checked + .slider { background: var(--color-accent); }
    .toggle-switch input:checked + .slider::before { transform: translateX(20px); }

    .quiet-hours {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid var(--color-border);
    }
    .hours-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      font-size: 14px;
      color: var(--color-dark-grey);
    }
    .hours-row input[type="time"] {
      padding: 8px 10px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 13px;
      font-family: var(--font-family);
      color: var(--color-primary);
    }
    .hours-row input[type="time"]:focus { outline: none; border-color: var(--color-accent); }

    .link-list { display: flex; flex-direction: column; }
    .link-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid var(--color-border);
      font-size: 13px;
      font-family: var(--font-family);
      color: var(--color-dark-grey);
      background: transparent;
      text-align: left;
      transition: color 0.15s;
    }
    .link-row:last-child { border-bottom: none; }
    .link-row:hover { color: var(--color-primary); }
    .link-row.danger-link:hover { color: var(--color-danger); }
    .link-row .material-icon {
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
      font-size: 20px;
      color: inherit;
    }
    .link-row .arrow { margin-left: auto; font-size: 18px; color: var(--color-light-grey); }
    .link-row span:nth-child(2) { flex: 1; }

    .save-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-accent);
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: var(--shadow-md);
      z-index: 500;
    }
    .save-toast .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; font-size: 20px; }
    .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; }
  `]
})
export class SettingsComponent {
  private notifSvc = inject(NotificationService);
  i18n = inject(TranslationService);

  notifSettings = { ...this.notifSvc.settings() };
  savingMode = true;
  autoCutoff = false;
  irrigationOpt = true;
  saveConfirm = signal(false);

  saveNotifSettings(): void {
    this.notifSvc.updateSettings(this.notifSettings);
    this.saveConfirm.set(true);
    setTimeout(() => this.saveConfirm.set(false), 2500);
  }
}
