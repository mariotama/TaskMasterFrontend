import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../core/http/api.service';
import { TaskType } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  taskForm!: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  taskId = signal<number | null>(null);
  errorMessage = signal('');

  // For template binding
  taskTypes = [
    { value: TaskType.DAILY, label: 'Daily' },
    { value: TaskType.MISSION, label: 'Mission' },
  ];

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.taskId.set(parseInt(id, 10));
      this.isEditMode.set(true);
      this.loadTask(this.taskId()!);
    }
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: [TaskType.DAILY, Validators.required],
      xpReward: [
        10,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      coinReward: [
        5,
        [Validators.required, Validators.min(0), Validators.max(50)],
      ],
      dueDate: [null],
    });
  }

  loadTask(id: number): void {
    this.isLoading.set(true);
    this.apiService.get(`tasks/${id}`).subscribe({
      next: (task: any) => {
        this.taskForm.patchValue({
          ...(task || {}),
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : '',
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading task', error);
        this.errorMessage.set('Failed to load task. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    const taskData = this.taskForm.value;

    if (this.isEditMode()) {
      this.apiService.patch(`tasks/${this.taskId()}`, taskData).subscribe({
        next: () => this.handleSuccess('Task updated successfully!'),
        error: (error) => this.handleError('Failed to update task', error),
      });
    } else {
      this.apiService.post('tasks', taskData).subscribe({
        next: () => this.handleSuccess('Task created successfully!'),
        error: (error) => this.handleError('Failed to create task', error),
      });
    }
  }

  private handleSuccess(message: string): void {
    this.isSubmitting.set(false);
    // Show success message (could use a toast service here)
    console.log(message);
    this.router.navigate(['/tasks']);
  }

  private handleError(message: string, error: any): void {
    this.isSubmitting.set(false);
    console.error(message, error);
    this.errorMessage.set(error?.error?.message || message);
  }
}
