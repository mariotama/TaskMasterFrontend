import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable, catchError, map, tap } from 'rxjs';
import { Task, TaskCompletion } from '../../../shared/models/task.model';
import { ProgressionResult } from '../../../shared/models/progression.model';
import { LevelUpService } from '../../../shared/services/level-up.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiService = inject(ApiService);
  private levelUpService = inject(LevelUpService);
  private notificationService = inject(NotificationService);

  /**
   * Get all tasks for the current user
   */
  getAllTasks(): Observable<Task[]> {
    return this.apiService.get<Task[]>('tasks');
  }

  /**
   * Get a specific task by ID
   */
  getTaskById(id: number): Observable<Task> {
    return this.apiService.get<Task>(`tasks/${id}`);
  }

  /**
   * Create a new task
   */
  createTask(taskData: Partial<Task>): Observable<Task> {
    return this.apiService.post<Task>('tasks', taskData).pipe(
      tap(() => {
        // Show notification
        this.notificationService.success('Task created successfully');
      })
    );
  }

  /**
   * Update an existing task
   */
  updateTask(id: number, taskData: Partial<Task>): Observable<Task> {
    return this.apiService.patch<Task>(`tasks/${id}`, taskData).pipe(
      tap(() => {
        // Show notification
        this.notificationService.success('Task updated successfully');
      })
    );
  }

  /**
   * Delete a task
   */
  deleteTask(id: number): Observable<any> {
    return this.apiService.delete(`tasks/${id}`).pipe(
      tap(() => {
        // Show notification
        this.notificationService.info('Task deleted');
      })
    );
  }

  /**
   * Complete a task and get rewards
   */
  completeTask(id: number): Observable<ProgressionResult> {
    return this.apiService
      .post<ProgressionResult>(`tasks/${id}/complete`, {})
      .pipe(
        tap((result) => {
          console.log('Task completion result:', result);

          // If user leveled up, show level up animation
          if (result.leveledUp) {
            this.levelUpService.showLevelUp(result.currentLevel);
          }

          // Play coin sound effect
          this.playCoinSound();
        }),
        catchError((error) => {
          console.error('Error completing task:', error);
          this.notificationService.error('Failed to complete task');
          throw error;
        })
      );
  }

  /**
   * Get task completion history
   */
  getTaskCompletionHistory(
    page: number = 1,
    limit: number = 10
  ): Observable<{ completions: TaskCompletion[]; total: number }> {
    return this.apiService
      .get<{ completions: TaskCompletion[]; total: number }>(
        'tasks/history/completions',
        { page, limit }
      )
      .pipe(
        map((response) => {
          // Filter out completions with missing task data
          if (response.completions) {
            response.completions = response.completions.filter(
              (c) => c && c.task
            );
          } else {
            response.completions = [];
          }
          return response;
        }),
        tap((data) => console.log('Filtered task completion history:', data)),
        catchError((error) => {
          console.error('Error fetching task history:', error);
          throw error;
        })
      );
  }

  /**
   * Get task statistics
   */
  getTaskStatistics(): Observable<any> {
    return this.apiService.get('tasks/stats/summary');
  }

  /**
   * Play coin sound when completing task
   */
  private playCoinSound(): void {
    try {
      const audio = new Audio('assets/sounds/coin.mp3');
      audio.volume = 0.3; // 30% volume
      audio.play().catch((error) => {
        console.warn('Could not play coin sound:', error);
      });
    } catch (error) {
      console.warn('Error playing coin sound:', error);
    }
  }
}
