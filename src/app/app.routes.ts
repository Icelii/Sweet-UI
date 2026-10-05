import { Routes } from '@angular/router';
import { MainLayout } from '@layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    title: 'title.home',
    component: MainLayout,
    children: [
      
    ],
  },
  {
    path: '**',
    title: 'title.notFound',
    loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
  }
];