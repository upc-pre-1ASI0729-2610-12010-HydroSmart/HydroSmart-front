import { Injectable, signal, computed } from '@angular/core';
import { Suggestion, NotificationSettings } from '../domain/notification.model';
import notificationsData from '../infrastructure/mock-data/notifications.json';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Suggestion[]>(this.loadNotifications());
  isOpen = signal<boolean>(false);

  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
  urgentNotifications = computed(() => this.notifications().filter(n => n.isUrgent));

  settings = signal<NotificationSettings>({
    userId: 'usr-001',
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    alertOnLeak: true,
    alertOnAnomaly: true,
    alertOnThresholdExceeded: true,
    weeklyReportEnabled: true,
    monthlyReportEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  });

  private loadNotifications(): Suggestion[] {
    return (notificationsData as any[]).map(raw =>
      new Suggestion(
        raw.id, raw.userId, raw.type, raw.title, raw.body,
        raw.priority, raw.isRead, new Date(raw.createdAt),
        raw.readAt ? new Date(raw.readAt) : null,
        raw.actionUrl ?? null, raw.icon
      )
    );
  }

  markAsRead(notificationId: string): void {
    const notif = this.notifications().find(n => n.id === notificationId);
    if (notif) { notif.markAsRead(); this.notifications.set([...this.notifications()]); }
  }

  markAllAsRead(): void {
    this.notifications().forEach(n => n.markAsRead());
    this.notifications.set([...this.notifications()]);
  }

  togglePanel(): void { this.isOpen.update(open => !open); }
  closePanel(): void { this.isOpen.set(false); }

  updateSettings(updates: Partial<NotificationSettings>): void {
    this.settings.update(s => ({ ...s, ...updates }));
  }
}
