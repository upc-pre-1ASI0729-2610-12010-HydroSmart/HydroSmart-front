import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/presentation/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/presentation/components/header/header.component';
import { NotificationService } from '../../../shared/application/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, FormsModule],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-header title="Configuración" subtitle="Gestiona tus preferencias de la aplicación" />

        <div class="page-body">
          <div class="settings-grid">
            <!-- Saving Mode -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon green">eco</span>
                <div>
                  <h3>Modo de Ahorro Automático</h3>
                  <p>Configura cómo HydroSmart optimiza tu consumo</p>
                </div>
              </div>
              <div class="toggle-list">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Modo ahorro activo</span>
                    <span class="toggle-desc">Aplica recomendaciones automáticamente durante horas de bajo consumo</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="savingMode" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Corte automático ante fugas</span>
                    <span class="toggle-desc">Cierra la válvula principal si se detecta una fuga mayor a 1 L/min</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="autoCutoff" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Optimización de horario de riego</span>
                    <span class="toggle-desc">Sugiere el mejor horario de riego para reducir evaporación</span>
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
                  <h3>Notificaciones y Alertas</h3>
                  <p>Controla qué notificaciones recibes y cómo</p>
                </div>
              </div>
              <div class="toggle-list">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Notificaciones push</span>
                    <span class="toggle-desc">Recibe alertas en tiempo real en el navegador</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.enablePushNotifications"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Alertas de fuga</span>
                    <span class="toggle-desc">Notificación inmediata ante cualquier fuga detectada</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.alertOnLeak"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Alertas de consumo anómalo</span>
                    <span class="toggle-desc">Te avisa cuando el consumo supera 3× el promedio diario</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.alertOnAnomaly"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Alerta de umbral excedido</span>
                    <span class="toggle-desc">Notificación cuando tu meta mensual está en riesgo</span>
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
                  <h3>Reportes Personalizados</h3>
                  <p>Configura la frecuencia de tus reportes automáticos</p>
                </div>
              </div>
              <div class="toggle-list">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Reporte semanal</span>
                    <span class="toggle-desc">Recibe un resumen de tu consumo cada lunes</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.weeklyReportEnabled"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Reporte mensual</span>
                    <span class="toggle-desc">Análisis detallado el primer día de cada mes</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="notifSettings.monthlyReportEnabled"
                      (change)="saveNotifSettings()" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="quiet-hours">
                <span class="toggle-label">Horas de silencio</span>
                <div class="hours-row">
                  <input type="time" [(ngModel)]="notifSettings.quietHoursStart" />
                  <span>a</span>
                  <input type="time" [(ngModel)]="notifSettings.quietHoursEnd" />
                </div>
              </div>
            </div>

            <!-- Help & Support -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon orange">help_outline</span>
                <div>
                  <h3>Ayuda y Soporte</h3>
                  <p>Recursos y asistencia para el uso de HydroSmart</p>
                </div>
              </div>
              <div class="link-list">
                <button class="link-row">
                  <span class="material-icon">menu_book</span>
                  <span>Guía de usuario</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">support_agent</span>
                  <span>Contactar soporte técnico</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">video_library</span>
                  <span>Tutoriales en video</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">bug_report</span>
                  <span>Reportar un problema</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
              </div>
            </div>

            <!-- Security -->
            <div class="card">
              <div class="card-section-header">
                <span class="material-icon section-icon red">security</span>
                <div>
                  <h3>Seguridad y Privacidad</h3>
                  <p>Gestiona el acceso y la protección de tus datos</p>
                </div>
              </div>
              <div class="link-list">
                <button class="link-row">
                  <span class="material-icon">lock</span>
                  <span>Cambiar contraseña</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">devices</span>
                  <span>Sesiones activas</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row">
                  <span class="material-icon">download</span>
                  <span>Descargar mis datos</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
                <button class="link-row danger-link">
                  <span class="material-icon">delete_forever</span>
                  <span>Eliminar cuenta</span>
                  <span class="material-icon arrow">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          @if (saveConfirm()) {
            <div class="save-toast">
              <span class="material-icon">check_circle</span>
              Configuración guardada.
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
