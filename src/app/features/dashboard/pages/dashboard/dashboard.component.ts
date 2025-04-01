import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserStatsCardComponent } from '../../components/user-stats-card/user-stats-card.component';
import { PendingTasksWidgetComponent } from '../../components/pending-tasks-widget/pending-tasks-widget.component';
import { ActivitySummaryComponent } from '../../components/activity-summary/activity-summary.component';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    UserStatsCardComponent,
    PendingTasksWidgetComponent,
    ActivitySummaryComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private authService = inject(AuthService);
  username = this.authService.currentUser()?.username || 'Adventurer';
}
