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
    this.loadPendingTasks();
  }

  loadPendingTasks(): void {
    this.isLoading.set(true);

    this.apiService.get<Task[]>('tasks').subscribe({
      next: (allTasks) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        this.apiService
          .get<any>('tasks/history/completions', {
            page: 1,
            limit: 100,
          })
          .subscribe({
            next: (completionsData) => {
              const completions = completionsData.completions || [];

              const todayCompletions = completions.filter((completion: any) => {
                const completedDate = new Date(completion.completedAt);
                return completedDate >= today && completedDate < tomorrow;
              });

              const completedTodayIds = todayCompletions
                .map((c: any) => c.task?.id)
                .filter((id: number) => id !== undefined);

              const pendingTasks = allTasks.filter((task) => {
                if (task.type === TaskType.MISSION) {
                  return !task.isCompleted;
                }

                return !completedTodayIds.includes(task.id);
              });

              this.totalTasks.set(pendingTasks.length);
              this.tasks.set(pendingTasks.slice(0, 5));
              this.isLoading.set(false);
            },
            error: (error) => {
              const pendingTasks = allTasks.filter((task) =>
                task.type === TaskType.MISSION ? !task.isCompleted : true
              );
              this.totalTasks.set(pendingTasks.length);
              this.tasks.set(pendingTasks.slice(0, 5));
              this.isLoading.set(false);
            },
          });
      },
      error: (error) => {
        this.isLoading.set(false);
      },
    });
  }
}
