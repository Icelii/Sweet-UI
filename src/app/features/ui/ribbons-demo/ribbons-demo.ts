import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { TONES } from '../ui-tones';

interface Plan {
  key: string;
  name: TranslationKey;
  price: string;
  features: TranslationKey[];
  popular?: boolean;
}

interface Product {
  name: string;
  price: string;
  oldPrice?: string;
  icon: TablerIconName;
  gradient: string;
  ribbon?: { kind: 'corner' | 'side'; label: string | TranslationKey; tone: string };
}

@Component({
  selector: 'app-ribbons-demo',
  imports: [TablerIcon, TranslatePipe],
  templateUrl: './ribbons-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RibbonsDemo {
  protected readonly tones = TONES.slice(0, 6);

  protected readonly plans: Plan[] = [
    { key: 'basic', name: 'ui.lists.plan.basic', price: '$0', features: ['ui.ribbons.f.projects3', 'ui.ribbons.f.reports', 'ui.ribbons.f.emailSupport'] },
    { key: 'pro', name: 'ui.lists.plan.pro', price: '$19', popular: true, features: ['ui.ribbons.f.projectsUnlimited', 'ui.modals.feature1', 'ui.modals.feature3', 'ui.ribbons.f.integrations'] },
    { key: 'team', name: 'ui.lists.plan.team', price: '$49', features: ['ui.ribbons.f.everythingPro', 'ui.modals.feature2', 'ui.ribbons.f.roles', 'ui.ribbons.f.sla'] },
  ];

  protected readonly products: Product[] = [
    { name: 'Vestido midi de lino', price: '$899', oldPrice: '$1,120', icon: 'tag', gradient: 'from-(--primary-color)/30 to-secondary/30', ribbon: { kind: 'corner', label: '-20%', tone: 'danger' } },
    { name: 'Bolso de piel', price: '$1,450', icon: 'shopping-cart', gradient: 'from-accent/40 to-warning/30', ribbon: { kind: 'side', label: 'ui.badge.new', tone: 'success' } },
    { name: 'Lentes de sol', price: '$620', icon: 'eye', gradient: 'from-info/30 to-success/25' },
    { name: 'Sombrero de palma', price: '$380', oldPrice: '$450', icon: 'star', gradient: 'from-warning/30 to-accent/30', ribbon: { kind: 'corner', label: 'ui.ribbons.lastUnits', tone: 'warning' } },
  ];

  protected readonly favorites = signal<string[]>(['Bolso de piel']);

  protected toggleFavorite(name: string): void {
    this.favorites.update((list) => (list.includes(name) ? list.filter((item) => item !== name) : [...list, name]));
  }
}