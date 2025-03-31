import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/http/api.service';
import { Task, TaskType } from '../../../../shared/models/task.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  isLoading = signal(true);
  currentFilter = signal('all');

  ngOnInit(): void {
    // Only load tasks if authenticated
    if (this.authService.isAuthenticated()) {
      this.loadTasks();
    } else {
      console.log('Not authenticated, waiting for auth state');
      // Subscribe to auth changes and load tasks when authenticated
      this.authService.user$.subscribe((user) => {
        if (user) {
          this.loadTasks();
        }
      });
    }
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.apiService.get<Task[]>('tasks').subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.applyFilter(this.currentFilter());
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks', error);
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(filter: string): void {
    this.currentFilter.set(filter);

    switch (filter) {
      case 'daily':
        this.filteredTasks.set(
          this.tasks().filter((task) => task.type === TaskType.DAILY)
        );
        break;
      case 'missions':
        this.filteredTasks.set(
          this.tasks().filter((task) => task.type === TaskType.MISSION)
        );
        break;
      case 'completed':
        this.filteredTasks.set(this.tasks().filter((task) => task.isCompleted));
        break;
      default:
        this.filteredTasks.set(this.tasks());
    }
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.apiService.delete(`tasks/${id}`).subscribe({
        next: () => {
          this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
          this.applyFilter(this.currentFilter());
        },
        error: (error) => console.error('Error deleting task', error),
      });
    }
  }
}
