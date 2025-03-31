import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES
      ),
    // Agregaremos el guardia de autenticación en la Fase 2
  },
  {
    path: 'tasks',
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
    // Agregaremos el guardia de autenticación en la Fase 2
  },
  {
    path: 'shop',
    loadChildren: () =>
      import('./features/shop/shop.routes').then((m) => m.SHOP_ROUTES),
    // Agregaremos el guardia de autenticación en la Fase 2
  },
  {
    path: 'achievements',
    loadChildren: () =>
      import('./features/achievements/achievements.routes').then(
        (m) => m.ACHIEVEMENTS_ROUTES
      ),
    // Agregaremos el guardia de autenticación en la Fase 2
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
