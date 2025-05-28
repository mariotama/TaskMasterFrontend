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
      dueDate: [''],
    });
  }

  loadTask(id: number): void {
    this.isLoading.set(true);
    this.apiService.get(`tasks/${id}`).subscribe({
      next: (task: any) => {
        // Formatting the due date to a string in 'YYYY-MM-DD' format
        let formattedDueDate = '';
        if (task.dueDate) {
          const date = new Date(task.dueDate);
          if (!isNaN(date.getTime())) {
            formattedDueDate = date.toISOString().split('T')[0];
          }
        }

        this.taskForm.patchValue({
          title: task.title || '',
          description: task.description || '',
          type: task.type || TaskType.DAILY,
          xpReward: task.xpReward || 10,
          coinReward: task.coinReward || 5,
          dueDate: formattedDueDate,
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
      console.log('Form invalid. Errors:', this.getFormValidationErrors());
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formData = this.taskForm.value;
    const taskData = {
      ...formData,
      dueDate: formData.dueDate || null,
    };

    console.log('Submitting task data:', taskData);

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
    console.log(message);
    this.router.navigate(['/tasks']);
  }

  private handleError(message: string, error: any): void {
    this.isSubmitting.set(false);
    console.error(message, error);

    if (error?.status === 400) {
      this.errorMessage.set(
        'Invalid task data. Please check all fields and try again.'
      );
    } else if (error?.status === 404) {
      this.errorMessage.set('Task not found. It may have been deleted.');
    } else {
      this.errorMessage.set(
        error?.error?.message || 'An error occurred. Please try again.'
      );
    }
  }

  private getFormValidationErrors(): any {
    const result: any = {};
    Object.keys(this.taskForm.controls).forEach((key) => {
      const controlErrors = this.taskForm.get(key)?.errors;
      if (controlErrors) {
        result[key] = controlErrors;
      }
    });
    return result;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${fieldName} cannot exceed ${field.errors['max'].max}`;
      }
    }
    return '';
  }
}
