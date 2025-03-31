import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() delete = new EventEmitter<number>();

  onDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit(this.task.id);
  }
}
