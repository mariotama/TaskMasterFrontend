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
    // Fetch only incomplete tasks for the dashboard widget
    this.apiService.get<Task[]>('tasks', { isCompleted: false }).subscribe({
      next: (data) => {
        // Limit to 5 tasks for the widget
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
