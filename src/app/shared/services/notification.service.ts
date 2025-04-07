import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationOptions {
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
  soundEffect?: boolean;
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
  private soundEffectsEnabled = true;

  // Observable for active notifications
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  // Sound effects (placeholders for actual sound files!)
  private readonly soundMap = {
    success: 'success.mp3',
    error: 'error.mp3',
    warning: 'warning.mp3',
    info: 'info.mp3',
    achievement: 'achievement.mp3',
    levelUp: 'level-up.mp3',
    coin: 'coin.mp3',
    task: 'task-complete.mp3',
  };

  constructor() {}

  /**
   * Toggle sound effects
   */
  toggleSoundEffects(enabled: boolean): void {
    this.soundEffectsEnabled = enabled;
  }

  /**
   * Show a success notification
   */
  success(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'success', soundEffect: true, ...options });
  }

  /**
   * Show an error notification
   */
  error(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'error', soundEffect: true, ...options });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'warning', soundEffect: true, ...options });
  }

  /**
   * Show an info notification
   */
  info(message: string, options?: NotificationOptions): void {
    this.show(message, { type: 'info', soundEffect: true, ...options });
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
      soundEffect: true,
      duration: 5000,
      ...options,
    });

    // Play special achievement sound
    if (this.soundEffectsEnabled && options?.soundEffect !== false) {
      this.playSound('achievement');
    }
  }

  /**
   * Show a level up notification
   */
  levelUp(level: number, options?: NotificationOptions): void {
    const message = `Level Up! You are now level ${level}`;
    this.show(message, {
      type: 'success',
      soundEffect: true,
      duration: 5000,
      ...options,
    });

    // Play level up sound
    if (this.soundEffectsEnabled && options?.soundEffect !== false) {
      this.playSound('levelUp');
    }
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

    // Play sound if enabled
    if (this.soundEffectsEnabled && finalOptions.soundEffect) {
      this.playSound(finalOptions.type);
    }

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

  /**
   * Play a sound effect
   */
  private playSound(type: string): void {
    try {
      const soundFile =
        this.soundMap[type as keyof typeof this.soundMap] || this.soundMap.info;
      const audio = new Audio(`assets/sounds/${soundFile}`);
      audio.volume = 0.5; // 50% volume
      audio.play().catch((error) => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }
}
