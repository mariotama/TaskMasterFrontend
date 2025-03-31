import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskDetailComponent } from './pages/task-detail/task-detail.component';
import { TaskFormComponent } from './pages/task-form/task-form.component';

export const TASKS_ROUTES: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'new', component: TaskFormComponent },
  { path: ':id', component: TaskDetailComponent },
  { path: ':id/edit', component: TaskFormComponent },
  { path: ':id/complete', component: TaskDetailComponent },
];
