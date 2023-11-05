import { Routes } from '@angular/router';
import { hasRole } from './guards/auth.guard';
import { Role } from '../generated/graphql.types';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./app.main.component').then(m => m.AppMainComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'admin',
        loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
        canActivate: [ hasRole ],
        data: { role: Role.Superadmin },
      },
      {
        path: 'workouts',
        children: [
          {
            path: '',
            loadComponent: () => import('./workout-templates/workout-templates/workout-templates.component').then(m => m.WorkoutTemplatesComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./workout-templates/mutate-workout-template/mutate-workout-template.component').then(m => m.MutateWorkoutTemplateComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
          {
            path: 'edit',
            loadComponent: () => import('./workout-templates/mutate-workout-template/mutate-workout-template.component').then(m => m.MutateWorkoutTemplateComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
          {
            path: 'edit/:workoutTemplateId',
            loadComponent: () => import('./workout-templates/mutate-workout-template/mutate-workout-template.component').then(m => m.MutateWorkoutTemplateComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
        ],
      },
      {
        path: 'schedules',
        children: [
          {
            path: '',
            loadComponent: () => import('./schedules/schedules/schedules.component').then(m => m.SchedulesComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./schedules/mutate-schedule/mutate-schedule.component').then(m => m.MutateScheduleComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
          {
            path: 'edit',
            loadComponent: () => import('./schedules/mutate-schedule/mutate-schedule.component').then(m => m.MutateScheduleComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
          {
            path: 'edit/:scheduleId',
            loadComponent: () => import('./schedules//mutate-schedule/mutate-schedule.component').then(m => m.MutateScheduleComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
        ],
      },
      {
        path: 'programs',
        children: [
          {
            path: '',
            loadComponent: () => import('./programs/programs/programs.component').then(m => m.ProgramsComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./programs/generate-program/generate-program.component').then(m => m.GenerateProgramComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
          {
            path: 'edit',
            loadComponent: () => import('./programs/mutate-program/mutate-program.component').then(m => m.MutateProgramComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
          {
            path: 'edit/:programId',
            loadComponent: () => import('./programs/mutate-program/mutate-program.component').then(m => m.MutateProgramComponent),
            canDeactivate: ['unsavedChangesGuard'],
          },
        ],
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
      },
      {
        path: 'signup',
        loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () => import('./pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
      },
    ],
  },
];
