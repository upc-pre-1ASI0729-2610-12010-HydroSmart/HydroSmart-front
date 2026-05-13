import { Component, inject, Input } from '@angular/core';
import { NotificationService } from '../../../application/notification.service';
import { NotificationsComponent } from '../../notifications/notifications.component';

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
      </div>
      <div class="topbar-right">
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
      align-items: baseline;
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

    .topbar-right { display: flex; align-items: center; gap: 8px; }

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
  unreadCount = this.notifService.unreadCount;

  toggleNotifications(): void {
    this.notifService.togglePanel();
  }
}
