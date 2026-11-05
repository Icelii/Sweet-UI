import { FlatNavItem, NavSection } from '@core/interfaces/navigation';

export const NAVIGATION: NavSection[] = [
  {
    items: [
      { path: '/dashboard', label: 'nav.dashboard', icon: 'dashboard' },
    ],
  },
  {
    title: 'nav.section.apps',
    items: [
      { path: '/chat', label: 'nav.chat', icon: 'message-circle' },
    ],
  },
  {
    title: 'nav.section.uiElements',
    items: [
      { path: '/ui/accordions', label: 'nav.accordions', icon: 'layout-rows' },
      { path: '/ui/avatars', label: 'nav.avatars', icon: 'user-circle' },
      { path: '/ui/badges', label: 'nav.badges', icon: 'tag' },
      { path: '/ui/breadcrumbs', label: 'nav.breadcrumbs', icon: 'route' },
      { path: '/ui/buttons', label: 'nav.buttons', icon: 'click' },
      { path: '/ui/cards', label: 'nav.cards', icon: 'cards' },
      { path: '/ui/dropdowns', label: 'nav.dropdowns', icon: 'square-chevron-down' },
      { path: '/ui/lists', label: 'nav.lists', icon: 'list' },
      { path: '/ui/modals', label: 'nav.modals', icon: 'app-window' },
      { path: '/ui/progress', label: 'nav.progress', icon: 'progress' },
      { path: '/ui/ribbons', label: 'nav.ribbons', icon: 'bookmark' },
      { path: '/ui/spinners', label: 'nav.spinners', icon: 'loader' },
      { path: '/ui/tabs', label: 'nav.tabs', icon: 'browser' },
      { path: '/ui/timelines', label: 'nav.timelines', icon: 'timeline-event' },
      { path: '/ui/tooltips', label: 'nav.tooltips', icon: 'message-circle' },
    ],
  },
  {
    title: 'nav.section.data',
    items: [
      {
        path: '/ui/forms',
        label: 'nav.forms',
        icon: 'forms',
        children: [
          { path: '/ui/forms/form-elements', label: 'nav.formElements' },
          { path: '/ui/forms/form-layouts', label: 'nav.formLayouts' },
          { path: '/ui/datepicker', label: 'nav.datepicker' },
        ],
      },
      { path: '/ui/pagination', label: 'nav.pagination', icon: 'dots' },
      { path: '/ui/tables', label: 'nav.tables', icon: 'table' },
    ],
  },
  {
    title: 'nav.section.extra',
    items: [
      { path: '/ui/charts', label: 'nav.charts', icon: 'chart-pie' },
      {
        path: '/auth',
        label: 'nav.auth',
        icon: 'lock',
        children: [
          { path: '/auth/login', label: 'nav.login' },
          { path: '/auth/register', label: 'nav.register' },
          { path: '/auth/forgot-password', label: 'nav.forgotPassword' },
          { path: '/auth/reset-password', label: 'nav.resetPassword' },
          { path: '/auth/two-factor', label: 'nav.twoFactor' },
        ],
      },
      {
        path: '',
        label: 'nav.error-pages',
        icon: 'alert-triangle',
        children: [
          { path: '/not-found', label: 'nav.404' },
        ],
      },
    ],
  },
];

export function flattenNavigation(sections: NavSection[]): FlatNavItem[] {
  return sections.flatMap((section) =>
    section.items.map((item, index) =>
      index === 0 && section.title ? { ...item, section: section.title } : item,
    ),
  );
}