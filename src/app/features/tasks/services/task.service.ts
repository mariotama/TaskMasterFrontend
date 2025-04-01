import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable, catchError, map, tap } from 'rxjs';
import { Task, TaskCompletion } from '../../../shared/models/task.model';
import { ProgressionResult } from '../../../shared/models/progression.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiService = inject(ApiService);

  getAllTasks(): Observable<Task[]> {
    return this.apiService.get<Task[]>('tasks');
  }

  getTaskById(id: number): Observable<Task> {
    return this.apiService.get<Task>(`tasks/${id}`);
  }

  createTask(taskData: Partial<Task>): Observable<Task> {
    return this.apiService.post<Task>('tasks', taskData);
  }

  updateTask(id: number, taskData: Partial<Task>): Observable<Task> {
    return this.apiService.patch<Task>(`tasks/${id}`, taskData);
  }

  deleteTask(id: number): Observable<any> {
    return this.apiService.delete(`tasks/${id}`);
  }

  completeTask(id: number): Observable<ProgressionResult> {
    return this.apiService
      .post<ProgressionResult>(`tasks/${id}/complete`, {})
      .pipe(
        tap((result) => console.log('Task completion result:', result)),
        catchError((error) => {
          console.error('Error completing task:', error);
          throw error;
        })
      );
  }

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
          // Make sure we have valid completions
          if (response.completions) {
            // Filter out completions with missing task data
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

  getTaskStatistics(): Observable<any> {
    return this.apiService.get('tasks/stats/summary');
  }
}
