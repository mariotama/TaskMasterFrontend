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

    // Primero obtenemos TODAS las tareas (incluidas las diarias)
    this.apiService.get<Task[]>('tasks').subscribe({
      next: (allTasks) => {
        // Luego obtenemos el historial de completados de HOY
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        this.apiService
          .get<any>('tasks/history/completions', {
            page: 1,
            limit: 100, // Asegurarnos de obtener todas las completadas hoy
          })
          .subscribe({
            next: (completionsData) => {
              const completions = completionsData.completions || [];

              // Filtrar solo las completadas hoy
              const todayCompletions = completions.filter((completion: any) => {
                const completedDate = new Date(completion.completedAt);
                return completedDate >= today && completedDate < tomorrow;
              });

              // IDs de tareas completadas hoy
              const completedTodayIds = todayCompletions
                .map((c: any) => c.task?.id)
                .filter((id: number) => id !== undefined);

              // Filtrar tareas pendientes
              const pendingTasks = allTasks.filter((task) => {
                // Si es una misión, solo verificar que no esté completada
                if (task.type === TaskType.MISSION) {
                  return !task.isCompleted;
                }

                // Si es una tarea diaria, verificar que no se haya completado hoy
                return !completedTodayIds.includes(task.id);
              });

              this.totalTasks.set(pendingTasks.length);
              this.tasks.set(pendingTasks.slice(0, 5));
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('Error loading completion history', error);
              // Fallback: mostrar todas las tareas no completadas
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
        console.error('Error loading tasks', error);
        this.isLoading.set(false);
      },
    });
  }
}
