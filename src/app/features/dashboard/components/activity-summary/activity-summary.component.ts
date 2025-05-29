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
  errorMessage = signal<string>('');

  ngOnInit(): void {
    // Load task statistics
    this.apiService.get('tasks/stats/summary').subscribe({
      next: (data) => {
        this.statistics.set(data);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load statistics');
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
          // Ensure we have valid completions array
          const completions = data.completions || [];

          // Make sure we only use completions that have valid task data
          const validCompletions = completions.filter((c) => c && c.task);

          this.recentActivity.set(validCompletions);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading recent activity', error);
          this.isLoading.set(false);
        },
      });
  }
}
