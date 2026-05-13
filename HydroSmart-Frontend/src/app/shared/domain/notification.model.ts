export type NotificationType = 'alert' | 'tip' | 'report' | 'achievement' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export class Suggestion {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public type: NotificationType,
    public title: string,
    public body: string,
    public priority: NotificationPriority,
    public isRead: boolean,
    public readonly createdAt: Date,
    public readAt: Date | null,
    public actionUrl: string | null,
    public icon: string
  ) {}

  get timeAgo(): string {
    const diff = Date.now() - this.createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  }

  get isUrgent(): boolean { return this.priority === 'urgent'; }

  markAsRead(): void {
    if (!this.isRead) { this.isRead = true; this.readAt = new Date(); }
  }

  requiresImmediateAction(): boolean { return this.priority === 'urgent' && !this.isRead; }
}

export interface NotificationSettings {
  userId: string;
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  alertOnLeak: boolean;
  alertOnAnomaly: boolean;
  alertOnThresholdExceeded: boolean;
  weeklyReportEnabled: boolean;
  monthlyReportEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}
