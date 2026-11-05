import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        title: 'title.login',
        loadComponent: () => import('@features/auth/pages/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        title: 'title.register',
        loadComponent: () => import('@features/auth/pages/register/register').then((m) => m.Register),
      },
      {
        path: 'forgot-password',
        title: 'title.forgotPassword',
        loadComponent: () =>
          import('@features/auth/pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password',
        title: 'title.resetPassword',
        loadComponent: () =>
          import('@features/auth/pages/reset-password/reset-password').then((m) => m.ResetPassword),
      },
      {
        path: 'two-factor',
        title: 'title.twoFactor',
        loadComponent: () =>
          import('@features/auth/pages/two-factor-code/two-factor-code').then((m) => m.TwoFactorCode),
      },
    ],
  },
];