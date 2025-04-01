import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/http/api.service';

@Component({
  selector: 'app-activity-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activity-summary.component.html',
  styleUrls: ['./activity-summary.component.scss'],
})
export class ActivitySummaryComponent implements OnInit {
  private apiService = inject(ApiService);

  statistics = signal<any>(null);
  recentActivity = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    // Load task statistics
    this.apiService.get('tasks/stats/summary').subscribe({
      next: (data) => {
        this.statistics.set(data);
      },
      error: (error) => {
        console.error('Error loading task statistics', error);
      },
    });

    // Load recent activity (completed tasks)
    this.apiService
      .get<{ completions?: any[] }>('tasks/history/completions', {
        page: 1,
        limit: 5,
      })
      .subscribe({
        next: (data) => {
          this.recentActivity.set(data.completions || []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading recent activity', error);
          this.isLoading.set(false);
        },
      });
  }
}
