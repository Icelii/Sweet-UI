import { FlatNavItem, NavSection } from '@core/interfaces/navigation';

export const NAVIGATION: NavSection[] = [
  {
    items: [
      { path: '/home', label: 'nav.dashboard', icon: 'dashboard' },
    ],
  },
  {
    title: 'nav.section.features',
    items: [
      {
        path: '/pages',
        label: 'nav.pages',
        icon: 'pages',
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