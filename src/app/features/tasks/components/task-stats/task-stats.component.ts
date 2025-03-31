import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-stats.component.html',
  styleUrls: ['./task-stats.component.scss'],
})
export class TaskStatsComponent implements OnInit {
  private taskService = inject(TaskService);

  isLoading = signal(true);
  stats = signal<{
    totalCompleted: number;
    dailyCompleted: number;
    missionsCompleted: number;
  }>({
    totalCompleted: 0,
    dailyCompleted: 0,
    missionsCompleted: 0,
  });

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.taskService.getTaskStatistics().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading task statistics', error);
        this.isLoading.set(false);
      },
    });
  }
}
