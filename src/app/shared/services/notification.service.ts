import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationOptions {
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationCounter = 0;

  // Observable for active notifications
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  /**
   * Show a success notification
   */
  success(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'success', ...options });
  }

  /**
   * Show an error notification
   */
  error(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'error', ...options });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'warning', ...options });
  }

  /**
   * Show an info notification
   */
  info(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'info', ...options });
  }

  /**
   * Show an achievement unlocked notification
   */
  achievementUnlocked(
    achievementName: string,
    options?: NotificationOptions
  ): void {
    const message = `Achievement Unlocked: ${achievementName}`;
    this.show(message, {
      type: 'success',
      duration: 5000,
      ...options,
    });
  }

  /**
   * Show a level up notification
   */
  levelUp(level: number, options?: NotificationOptions): void {
    const message = `Level Up! You are now level ${level}`;
    this.show(message, {
      type: 'success',
      duration: 5000,
      ...options,
    });
  }

  /**
   * Show a general notification
   */
  private show(message: string, options: NotificationOptions = {}): void {
    const defaultOptions = {
      duration: 3000,
      type: 'info' as const,
      soundEffect: false,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Create notification ID
    const id = ++this.notificationCounter;

    // Create notification object
    const notification: Notification = {
      id,
      message,
      type: finalOptions.type,
      icon: this.getIconForType(finalOptions.type),
    };

    // Add to list
    this.addNotification(notification);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, finalOptions.duration);
  }

  /**
   * Add a notification to the list
   */
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...currentNotifications, notification]);
    // Filter out duplicates
    const duplicates = currentNotifications.filter(
      (n) => n.message === notification.message && n.type === notification.type
    );

    // If a duplicate is found, remove it from the list
    if (duplicates.length > 0) {
      return;
    }

    this.notificationsSubject.next([...currentNotifications, notification]);
  }

  /**
   * Remove a notification from the list
   */
  private removeNotification(id: number): void {
    // Update the observable list
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next(
      currentNotifications.filter((n) => n.id !== id)
    );
  }

  /**
   * Get the icon for a notification type
   */
  private getIconForType(
    type: 'success' | 'error' | 'warning' | 'info'
  ): string {
    switch (type) {
      case 'success':
        return 'check-circle-fill';
      case 'error':
        return 'exclamation-triangle-fill';
      case 'warning':
        return 'exclamation-circle-fill';
      case 'info':
        return 'info-circle-fill';
      default:
        return 'bell-fill';
    }
  }
}
