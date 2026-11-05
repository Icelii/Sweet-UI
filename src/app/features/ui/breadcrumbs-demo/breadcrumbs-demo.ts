import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from '@shared/components/breadcrumb/breadcrumb';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-breadcrumbs-demo',
  imports: [Breadcrumb, TablerIcon, TranslatePipe],
  templateUrl: './breadcrumbs-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsDemo {
  protected readonly basic: BreadcrumbItem[] = [
    { label: 'nav.section.data', path: '/ui/tables' },
    { label: 'nav.tables', path: '/ui/tables' },
    { label: 'tables.detail.title' },
  ];

  protected readonly withIcons: BreadcrumbItem[] = [
    { label: 'nav.section.uiElements', path: '/ui/buttons', icon: 'click' },
    { label: 'nav.forms', path: '/ui/forms', icon: 'forms' },
    { label: 'nav.formLayouts', icon: 'file-text' },
  ];

  protected readonly separators: { key: BreadcrumbSeparator; label: TranslationKey }[] = [
    { key: 'chevron', label: 'ui.breadcrumbs.chevron' },
    { key: 'slash', label: 'ui.breadcrumbs.slash' },
    { key: 'dot', label: 'ui.breadcrumbs.dot' },
  ];

  protected readonly long: BreadcrumbItem[] = [
    { label: 'ui.breadcrumbs.sample.store', path: '/dashboard', icon: 'stores' },
    { label: 'ui.breadcrumbs.sample.catalog', path: '/ui/tables', icon: 'categories' },
    { label: 'ui.breadcrumbs.sample.clothes', path: '/ui/tables', icon: 'folder' },
    { label: 'ui.breadcrumbs.sample.women', path: '/ui/tables', icon: 'folder' },
    { label: 'ui.breadcrumbs.sample.dresses', path: '/ui/tables', icon: 'folder' },
    { label: 'ui.breadcrumbs.sample.product' },
  ];

  protected readonly header: BreadcrumbItem[] = [
    { label: 'nav.section.data', path: '/ui/tables' },
    { label: 'nav.tables', path: '/ui/tables' },
    { label: 'Verano 2026 · 20% en toda la tienda' },
  ];
}