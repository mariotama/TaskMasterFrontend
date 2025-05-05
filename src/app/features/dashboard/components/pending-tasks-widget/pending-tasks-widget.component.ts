import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/http/api.service';
import { Task, TaskType } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-pending-tasks-widget',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pending-tasks-widget.component.html',
  styleUrls: ['./pending-tasks-widget.component.scss'],
})
export class PendingTasksWidgetComponent implements OnInit {
  private apiService = inject(ApiService);

  tasks = signal<Task[]>([]);
  totalTasks = signal(0);
  isLoading = signal(true);

  ngOnInit(): void {
    // First, get the history of completions for today
    this.apiService
      .get<any>('tasks/history/completions', {
        page: 1,
        limit: 100,
      })
      .subscribe({
        next: (completionsData) => {
          const completionsToday = completionsData.completions || [];

          // Now we obtain the pending tasks
          this.apiService
            .get<Task[]>('tasks', { isCompleted: false })
            .subscribe({
              next: (data) => {
                // We filter the tasks based on the completions today
                const filteredTasks = data.filter((task) => {
                  // If it's a mission, we don't filter it
                  if (task.type !== 'daily') return true;

                  // For dailies, verify if it has been completed today
                  return !completionsToday.some(
                    (completion: { task: { id: number } }) =>
                      completion.task && completion.task.id === task.id
                  );
                });

                // Limit to 5 task on the widget...
                this.totalTasks.set(filteredTasks.length);
                this.tasks.set(filteredTasks.slice(0, 5));
                this.isLoading.set(false);
              },
              error: (error) => {
                console.error('Error loading tasks', error);
                this.isLoading.set(false);
              },
            });
        },
        error: (error) => {
          console.error('Error loading completion history', error);
          // If it fails, we load the tasks without filtering
          this.loadTasksWithoutFiltering();
        },
      });
  }

  // Backup method just in case
  private loadTasksWithoutFiltering(): void {
    this.apiService.get<Task[]>('tasks', { isCompleted: false }).subscribe({
      next: (data) => {
        this.totalTasks.set(data.length);
        this.tasks.set(data.slice(0, 5));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks', error);
        this.isLoading.set(false);
      },
    });
  }
}
