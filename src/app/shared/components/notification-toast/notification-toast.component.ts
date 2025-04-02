import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Notification,
  NotificationService,
} from '../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
})
export class NotificationToastComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];

  ngOnInit(): void {
    // Subscribe to notifications observable
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  /**
   * Close a notification
   */
  close(id: number): void {
    // Filter out the notification (the service handles DOM removal)
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    );
  }

  /**
   * Get animation class based on notification type
   */
  getAnimationClass(type: string): string {
    switch (type) {
      case 'success':
        return 'animate-success';
      case 'error':
        return 'animate-error';
      case 'warning':
        return 'animate-warning';
      case 'info':
      default:
        return 'animate-info';
    }
  }
}
