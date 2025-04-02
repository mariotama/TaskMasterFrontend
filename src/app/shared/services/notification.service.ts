import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
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
  private renderer: Renderer2;
  private notificationContainer: HTMLElement | null = null;
  private notificationCounter = 0;
  private soundEffectsEnabled = true;

  // Observable for active notifications
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  // Sound effects
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

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initContainer();
  }

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

    // Create DOM element
    this.createNotificationElement(notification);

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
   * Initialize notification container
   */
  private initContainer(): void {
    // Check if container already exists
    if (document.getElementById('notification-container')) {
      this.notificationContainer = document.getElementById(
        'notification-container'
      );
      return;
    }

    // Create the container
    this.notificationContainer = this.renderer.createElement('div');
    this.renderer.setAttribute(
      this.notificationContainer,
      'id',
      'notification-container'
    );
    this.renderer.addClass(
      this.notificationContainer,
      'notification-container'
    );

    // Append to body
    this.renderer.appendChild(document.body, this.notificationContainer);

    // Add styles
    this.addContainerStyles();
  }

  /**
   * Add a notification to the list
   */
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.getValue();
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

    // Remove DOM element
    const notificationElement = document.getElementById(`notification-${id}`);
    if (notificationElement && this.notificationContainer) {
      // Add fadeout class
      this.renderer.addClass(notificationElement, 'notification-fadeout');

      // Remove after animation
      setTimeout(() => {
        if (
          this.notificationContainer &&
          notificationElement.parentNode === this.notificationContainer
        ) {
          this.renderer.removeChild(
            this.notificationContainer,
            notificationElement
          );
        }
      }, 300); // Match the CSS animation duration
    }
  }

  /**
   * Create notification DOM element
   */
  private createNotificationElement(notification: Notification): void {
    if (!this.notificationContainer) return;

    // Create notification element
    const element = this.renderer.createElement('div');
    this.renderer.setAttribute(
      element,
      'id',
      `notification-${notification.id}`
    );
    this.renderer.addClass(element, 'notification');
    this.renderer.addClass(element, `notification-${notification.type}`);

    // Create icon
    const iconElement = this.renderer.createElement('i');
    this.renderer.addClass(iconElement, 'notification-icon');
    this.renderer.addClass(iconElement, `bi`);
    this.renderer.addClass(iconElement, `bi-${notification.icon}`);

    // Create message
    const messageElement = this.renderer.createElement('div');
    this.renderer.addClass(messageElement, 'notification-message');
    this.renderer.setProperty(
      messageElement,
      'textContent',
      notification.message
    );

    // Create close button
    const closeElement = this.renderer.createElement('button');
    this.renderer.addClass(closeElement, 'notification-close');
    this.renderer.setProperty(closeElement, 'textContent', '×');
    this.renderer.listen(closeElement, 'click', () => {
      this.removeNotification(notification.id);
    });

    // Assemble the notification
    this.renderer.appendChild(element, iconElement);
    this.renderer.appendChild(element, messageElement);
    this.renderer.appendChild(element, closeElement);

    // Add to container
    this.renderer.appendChild(this.notificationContainer, element);

    // Trigger entrance animation after a small delay
    setTimeout(() => {
      this.renderer.addClass(element, 'notification-show');
    }, 10);
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

  /**
   * Add styles for notifications
   */
  private addContainerStyles(): void {
    // Check if styles already exist
    if (document.getElementById('notification-styles')) {
      return;
    }

    const styleEl = this.renderer.createElement('style');
    this.renderer.setAttribute(styleEl, 'id', 'notification-styles');

    const css = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      }
      
      .notification {
        display: flex;
        align-items: flex-start;
        padding: 12px 15px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background-color: white;
        margin-bottom: 8px;
        transform: translateX(120%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        overflow: hidden;
        max-width: 100%;
      }
      
      .notification-show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .notification-fadeout {
        transform: translateX(120%);
        opacity: 0;
      }
      
      .notification-icon {
        margin-right: 12px;
        font-size: 18px;
        flex-shrink: 0;
      }
      
      .notification-message {
        flex-grow: 1;
        font-size: 14px;
        line-height: 1.4;
        margin-right: 10px;
        word-break: break-word;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        color: #999;
        padding: 0 5px;
        align-self: flex-start;
        margin: -5px -5px 0 0;
      }
      
      .notification-close:hover {
        color: #333;
      }
      
      .notification-success {
        border-left: 4px solid #28a745;
      }
      
      .notification-success .notification-icon {
        color: #28a745;
      }
      
      .notification-error {
        border-left: 4px solid #dc3545;
      }
      
      .notification-error .notification-icon {
        color: #dc3545;
      }
      
      .notification-warning {
        border-left: 4px solid #ffc107;
      }
      
      .notification-warning .notification-icon {
        color: #ffc107;
      }
      
      .notification-info {
        border-left: 4px solid #17a2b8;
      }
      
      .notification-info .notification-icon {
        color: #17a2b8;
      }
    `;

    this.renderer.setProperty(styleEl, 'textContent', css);
    this.renderer.appendChild(document.head, styleEl);
  }
}
