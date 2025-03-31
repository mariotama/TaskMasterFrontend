import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/http/api.service';
import { Task } from '../../../../shared/models/task.model';
import { ProgressionResult } from '../../../../shared/models/progression.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
})
export class TaskDetailComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  task = signal<Task | null>(null);
  isLoading = signal(true);
  isCompleting = signal(false);
  showReward = signal(false);
  progressionResult = signal<ProgressionResult | null>(null);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(parseInt(id, 10));
    } else {
      this.errorMessage.set('Task ID not provided');
      this.isLoading.set(false);
    }
  }

  loadTask(id: number): void {
    this.apiService.get<Task>(`tasks/${id}`).subscribe({
      next: (data) => {
        this.task.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading task', error);
        this.errorMessage.set('Failed to load task details');
        this.isLoading.set(false);
      },
    });
  }

  completeTask(): void {
    if (!this.task() || this.isCompleting()) return;

    this.isCompleting.set(true);
    this.apiService
      .post<ProgressionResult>(`tasks/${this.task()?.id}/complete`, {})
      .subscribe({
        next: (result) => {
          this.progressionResult.set(result);
          this.isCompleting.set(false);
          this.showReward.set(true);

          // Update task status
          this.task.update((task) =>
            task ? { ...task, isCompleted: true } : null
          );

          // After 5 seconds, redirect back to task list
          setTimeout(() => {
            this.router.navigate(['/tasks']);
          }, 5000);
        },
        error: (error) => {
          console.error('Error completing task', error);
          this.errorMessage.set(
            error?.error?.message || 'Failed to complete task'
          );
          this.isCompleting.set(false);
        },
      });
  }
}
