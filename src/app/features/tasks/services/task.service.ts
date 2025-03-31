import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable } from 'rxjs';
import { Task } from '../../../shared/models/task.model';
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
    return this.apiService.post<ProgressionResult>(`tasks/${id}/complete`, {});
  }

  getTaskCompletionHistory(
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    return this.apiService.get('tasks/history/completions', { page, limit });
  }

  getTaskStatistics(): Observable<any> {
    return this.apiService.get('tasks/stats/summary');
  }
}
