import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../../../shared/models/task.model';
import { ProgressionResult } from '../../../../shared/models/progression.model';
import { LevelUpService } from '../../../../shared/services/level-up.service';
import { TaskCompleteComponent } from '../../components/task-complete/task-complete.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskCompleteComponent],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
})
export class TaskDetailComponent implements OnInit {
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private levelUpService = inject(LevelUpService);
  private notificationService = inject(NotificationService);

  task = signal<Task | null>(null);
  isLoading = signal(true);
  isCompleting = signal(false);
  showReward = signal(false);
  progressionResult = signal<ProgressionResult | null>(null);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isComplete = this.route.snapshot.url.some(
      (segment) => segment.path === 'complete'
    );

    if (id) {
      this.loadTask(parseInt(id, 10), isComplete);
    } else {
      this.errorMessage.set('Task ID not provided');
      this.isLoading.set(false);
    }
  }

  loadTask(id: number, autoComplete: boolean = false): void {
    this.taskService.getTaskById(id).subscribe({
      next: (data) => {
        this.task.set(data);
        this.isLoading.set(false);

        // If this is a complete URL and the task is not already completed, complete it
        if (autoComplete && !data.isCompleted) {
          this.completeTask();
        }
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
    this.taskService.completeTask(this.task()?.id as number).subscribe({
      next: (result) => {
        this.progressionResult.set(result);
        this.isCompleting.set(false);

        // Update task status
        this.task.update((task) =>
          task ? { ...task, isCompleted: true } : null
        );

        // Show completion rewards overlay
        this.showReward.set(true);

        // After 6 seconds, redirect back to task list if they haven't closed the modal
        setTimeout(() => {
          if (this.showReward()) {
            this.closeRewardAndNavigate();
          }
        }, 6000);
      },
      error: (error) => {
        console.error('Error completing task', error);
        this.errorMessage.set(
          error?.error?.message || 'Failed to complete task'
        );
        this.isCompleting.set(false);

        // Show error notification
        this.notificationService.error(
          'Failed to complete task: ' +
            (error?.error?.message || 'Unknown error')
        );
      },
    });
  }

  /**
   * Handler for when reward modal is closed
   */
  onRewardClosed(): void {
    this.closeRewardAndNavigate();
  }

  /**
   * Close the reward modal and navigate to task list
   */
  closeRewardAndNavigate(): void {
    this.showReward.set(false);
    this.router.navigate(['/tasks']);
  }
}
