import { Routes } from '@angular/router';
import { AuthLayout } from '@layouts/auth-layout/auth-layout';
import { MainLayout } from '@layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        title: 'title.home',
        loadComponent: () => import('@features/dashboard/dashboard').then((c) => c.Dashboard)
      },
      {
        path: 'ui/forms',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'form-elements' },
          {
            path: 'form-elements',
            title: 'title.forms',
            loadComponent: () => import('@features/ui/forms-demo/forms-demo').then((c) => c.FormsDemo)
          },
          {
            path: 'form-layouts',
            title: 'title.formLayouts',
            loadComponent: () => import('@features/ui/form-layouts/form-layouts').then((c) => c.FormLayouts)
          }
        ]
      },
      {
        path: 'ui/buttons',
        title: 'title.buttons',
        loadComponent: () => import('@features/ui/buttons-demo/buttons-demo').then((c) => c.ButtonsDemo)
      },
      {
        path: 'ui/badges',
        title: 'title.badges',
        loadComponent: () => import('@features/ui/badges-demo/badges-demo').then((c) => c.BadgesDemo)
      },
      {
        path: 'ui/avatars',
        title: 'title.avatars',
        loadComponent: () => import('@features/ui/avatars-demo/avatars-demo').then((c) => c.AvatarsDemo)
      },
      {
        path: 'ui/modals',
        title: 'title.modals',
        loadComponent: () => import('@features/ui/modals-demo/modals-demo').then((c) => c.ModalsDemo)
      },
      {
        path: 'ui/breadcrumbs',
        title: 'title.breadcrumbs',
        loadComponent: () => import('@features/ui/breadcrumbs-demo/breadcrumbs-demo').then((c) => c.BreadcrumbsDemo)
      },
      {
        path: 'ui/dropdowns',
        title: 'title.dropdowns',
        loadComponent: () => import('@features/ui/dropdowns-demo/dropdowns-demo').then((c) => c.DropdownsDemo)
      },
      {
        path: 'ui/lists',
        title: 'title.lists',
        loadComponent: () => import('@features/ui/lists-demo/lists-demo').then((c) => c.ListsDemo)
      },
      {
        path: 'ui/progress',
        title: 'title.progress',
        loadComponent: () => import('@features/ui/progress-demo/progress-demo').then((c) => c.ProgressDemo)
      },
      {
        path: 'ui/ribbons',
        title: 'title.ribbons',
        loadComponent: () => import('@features/ui/ribbons-demo/ribbons-demo').then((c) => c.RibbonsDemo)
      },
      {
        path: 'ui/spinners',
        title: 'title.spinners',
        loadComponent: () => import('@features/ui/spinners-demo/spinners-demo').then((c) => c.SpinnersDemo)
      },
      {
        path: 'ui/tabs',
        title: 'title.tabs',
        loadComponent: () => import('@features/ui/tabs-demo/tabs-demo').then((c) => c.TabsDemo)
      },
      {
        path: 'ui/tooltips',
        title: 'title.tooltips',
        loadComponent: () => import('@features/ui/tooltips-demo/tooltips-demo').then((c) => c.TooltipsDemo)
      },
      {
        path: 'ui/cards',
        title: 'title.cards',
        loadComponent: () => import('@features/ui/cards-demo/cards-demo').then((c) => c.CardsDemo)
      },
      {
        path: 'ui/timelines',
        title: 'title.timelines',
        loadComponent: () => import('@features/ui/timelines-demo/timelines-demo').then((c) => c.TimelinesDemo)
      },
      {
        path: 'ui/accordions',
        title: 'title.accordions',
        loadComponent: () => import('@features/ui/accordions-demo/accordions-demo').then((c) => c.AccordionsDemo)
      },
      {
        path: 'ui/tables',
        title: 'title.tables',
        loadComponent: () => import('@features/ui/tables-demo/tables-demo').then((c) => c.TablesDemo)
      },
      {
        path: 'ui/pagination',
        title: 'title.pagination',
        loadComponent: () => import('@features/ui/pagination-demo/pagination-demo').then((c) => c.PaginationDemo)
      },
      {
        path: 'chat',
        title: 'title.chat',
        loadComponent: () => import('@features/chat/chat').then((c) => c.Chat)
      },
      {
        path: 'ui/charts',
        title: 'title.charts',
        loadComponent: () => import('@features/ui/charts-demo/charts-demo').then((c) => c.ChartsDemo)
      },
      {
        path: 'ui/datepicker',
        title: 'title.datepicker',
        loadComponent: () => import('@features/ui/datepicker-demo/datepicker-demo').then((c) => c.DatepickerDemo)
      },
      {
        path: 'account-settings',
        loadChildren: () => import('@features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      }
    ],
  },
  {
    path: '**',
    title: 'title.notFound',
    loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
  }
];