import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { TaskCompletion } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-task-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-history.component.html',
  styleUrls: ['./task-history.component.scss'],
})
export class TaskHistoryComponent implements OnInit {
  private taskService = inject(TaskService);

  completions = signal<TaskCompletion[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(page: number = 1): void {
    this.isLoading.set(true);
    this.taskService.getTaskCompletionHistory(page).subscribe({
      next: (response) => {
        this.completions.set(response.completions);
        this.totalPages.set(Math.ceil(response.total / 10)); // Assuming 10 items per page
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading completion history', error);
        this.isLoading.set(false);
      },
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.loadHistory(newPage);
    }
  }
}
