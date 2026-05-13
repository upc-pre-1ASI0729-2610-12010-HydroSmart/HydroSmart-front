import { Component, inject, HostListener } from '@angular/core';
import { NotificationService } from '../../application/notification.service';
import { Suggestion } from '../../domain/notification.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    <div class="notif-overlay" (click)="close()"></div>
    <div class="notif-panel" (click)="$event.stopPropagation()">
      <div class="panel-header">
        <h2>Notificaciones</h2>
        @if (unreadCount() > 0) {
          <button class="mark-all-btn" (click)="markAllRead()">Marcar todo como leído</button>
        }
      </div>

      <div class="notif-list">
        @for (notif of notifications(); track notif.id) {
          <div
            class="notif-item"
            [class.unread]="!notif.isRead"
            [class.urgent]="notif.isUrgent"
            (click)="handleClick(notif)">
            <div class="notif-icon-wrap" [class]="'icon-' + notif.type">
              <span class="material-icon">{{ getIcon(notif) }}</span>
            </div>
            <div class="notif-content">
              <div class="notif-title">{{ notif.title }}</div>
              <div class="notif-body">{{ notif.body }}</div>
              <div class="notif-time">{{ notif.timeAgo }}</div>
            </div>
            @if (!notif.isRead) {
              <div class="unread-dot"></div>
            }
          </div>
        } @empty {
          <div class="empty-state">
            <span class="material-icon">notifications_none</span>
            <p>No hay notificaciones</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notif-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: transparent;
    }

    .notif-panel {
      position: fixed;
      top: 64px;
      right: 20px;
      width: 380px;
      max-height: 520px;
      background: var(--color-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 201;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border);
    }
    .panel-header h2 {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-primary);
    }

    .mark-all-btn {
      font-size: 12px;
      color: var(--color-accent);
      background: transparent;
      font-weight: 500;
      font-family: var(--font-family);
    }

    .notif-list {
      overflow-y: auto;
      flex: 1;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 20px;
      cursor: pointer;
      border-bottom: 1px solid var(--color-border);
      position: relative;
      transition: background 0.15s;
    }
    .notif-item:hover { background: var(--color-bg); }
    .notif-item.unread { background: #f0f9f5; }
    .notif-item.urgent { border-left: 3px solid var(--color-danger); }

    .notif-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-alert { background: #FDECEA; color: var(--color-danger); }
    .icon-tip { background: #E8F7F1; color: var(--color-accent); }
    .icon-report { background: #EBF3FD; color: #2980B9; }
    .icon-achievement { background: #FEF6E8; color: var(--color-warning); }
    .icon-system { background: var(--color-bg); color: var(--color-dark-grey); }

    .material-icon {
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
      font-size: 20px;
    }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: 2px;
    }
    .notif-body {
      font-size: 12px;
      color: var(--color-dark-grey);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .notif-time {
      font-size: 11px;
      color: var(--color-light-grey);
      margin-top: 4px;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-accent);
      flex-shrink: 0;
      margin-top: 4px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 20px;
      color: var(--color-light-grey);
      gap: 8px;
    }
    .empty-state .material-icon { font-size: 40px; }
    .empty-state p { font-size: 14px; }
  `]
})
export class NotificationsComponent {
  private notifService = inject(NotificationService);
  private router = inject(Router);

  notifications = this.notifService.notifications;
  unreadCount = this.notifService.unreadCount;

  close(): void {
    this.notifService.closePanel();
  }

  markAllRead(): void {
    this.notifService.markAllAsRead();
  }

  handleClick(notif: Suggestion): void {
    this.notifService.markAsRead(notif.id);
    if (notif.actionUrl) {
      this.router.navigate([notif.actionUrl]);
      this.close();
    }
  }

  getIcon(notif: Suggestion): string {
    const icons: Record<string, string> = {
      alert: 'warning',
      tip: 'lightbulb',
      report: 'description',
      achievement: 'emoji_events',
      system: 'info'
    };
    return icons[notif.type] ?? 'notifications';
  }
}
