import { Routes } from '@angular/router';
import { authGuard } from './shared/application/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/presentation/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./consumption-monitoring/presentation/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/presentation/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'devices',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./consumption-monitoring/presentation/devices/devices.component').then(m => m.DevicesComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./consumption-monitoring/presentation/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./savings-optimization/presentation/settings/settings.component').then(m => m.SettingsComponent)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
