import { Component, inject, Input } from '@angular/core';
import { NotificationService } from '../../../application/notification.service';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { TranslationService } from '../../../application/i18n/translation.service';
import { AuthService } from '../../../application/auth.service';
import { BuildingContextService } from '../../../application/building-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NotificationsComponent],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="page-title">{{ title }}</h1>
        @if (subtitle) {
          <span class="page-subtitle">{{ subtitle }}</span>
        }
        @if (isAdmin()) {
          <select class="unit-selector" (change)="onUnitChange($event)" [value]="buildingCtx.selectedUnitId() ?? ''">
            <option value="">{{ i18n.t('header.allBuilding') }}</option>
            @for (unit of buildingCtx.units; track unit.id) {
              <option [value]="unit.id">{{ i18n.t('sidebar.units') }} {{ unit.unitNumber }}</option>
            }
          </select>
        }
        @if (!isAdmin() && tenantUnit()) {
          <span class="tenant-unit-label">{{ i18n.t('sidebar.units') }} {{ tenantUnit()!.unitNumber }} — Piso {{ tenantUnit()!.floor }}</span>
        }
      </div>
      <div class="topbar-right">
        <button class="lang-toggle" (click)="toggleLang()" [title]="isEn() ? 'Switch to Spanish' : 'Cambiar a inglés'">
          <span class="lang-flag">{{ isEn() ? '🇺🇸' : '🇪🇸' }}</span>
          <span class="lang-code">{{ isEn() ? 'EN' : 'ES' }}</span>
        </button>
        <button class="notif-btn" (click)="toggleNotifications()">
          <span class="material-icon">notifications</span>
          @if (unreadCount() > 0) {
            <span class="badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
          }
        </button>
      </div>
    </header>

    @if (notifService.isOpen()) {
      <app-notifications />
    }
  `,
  styles: [`
    .topbar {
      height: 64px;
      background: var(--color-white);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-primary);
      margin: 0;
    }

    .page-subtitle {
      font-size: 13px;
      color: var(--color-dark-grey);
    }

    .unit-selector {
      height: 34px;
      padding: 0 10px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 13px;
      font-family: var(--font-family);
      color: var(--color-primary);
      background: var(--color-bg);
      cursor: pointer;
      outline: none;
    }
    .unit-selector:focus {
      border-color: var(--color-accent);
    }

    .tenant-unit-label {
      font-size: 13px;
      color: var(--color-dark-grey);
      background: var(--color-bg);
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      padding: 6px 10px;
    }

    .topbar-right { display: flex; align-items: center; gap: 8px; }

    .lang-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--color-bg);
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary);
      transition: all 0.15s;
    }
    .lang-toggle:hover {
      border-color: var(--color-accent);
      background: #E8F7F1;
    }
    .lang-flag { font-size: 16px; line-height: 1; }
    .lang-code { font-family: var(--font-family); font-size: 12px; }

    .notif-btn {
      position: relative;
      background: transparent;
      color: var(--color-dark-grey);
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .notif-btn:hover {
      background: var(--color-bg);
      color: var(--color-primary);
    }

    .material-icon {
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
      font-size: 22px;
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--color-danger);
      color: white;
      border-radius: 10px;
      padding: 0 4px;
      min-width: 16px;
      height: 16px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-family);
    }
  `]
})
export class HeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';

  notifService = inject(NotificationService);
  i18n = inject(TranslationService);
  buildingCtx = inject(BuildingContextService);
  private auth = inject(AuthService);

  unreadCount = this.notifService.unreadCount;
  isEn = this.i18n.isEnglish;

  isAdmin() {
    return this.auth.currentUser()?.role === 'BUILDING_ADMIN';
  }

  tenantUnit() {
    const user = this.auth.currentUser();
    if (!user || user.role !== 'TENANT') return null;
    return this.buildingCtx.getUnitForTenant(user.id);
  }

  onUnitChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.buildingCtx.selectUnit(value || null);
  }

  toggleNotifications(): void {
    this.notifService.togglePanel();
  }

  toggleLang(): void {
    this.i18n.toggleLanguage();
  }
}
