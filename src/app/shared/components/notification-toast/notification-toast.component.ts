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
}
