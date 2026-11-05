import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar } from '@shared/components/avatar/avatar';
import { Dropdown, DropdownItem, DropdownTrigger } from '@shared/components/dropdown/dropdown';
import { KpiCard, KpiTone } from '@shared/components/kpi-card/kpi-card';
import { Progress } from '@shared/components/progress/progress';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

interface Post {
  title: TranslationKey;
  excerpt: TranslationKey;
  tag: TranslationKey;
  tone: string;
  icon: TablerIconName;
  gradient: string;
  author: string;
  date: string;
}

@Component({
  selector: 'app-cards-demo',
  imports: [RouterLink, Avatar, Dropdown, DropdownTrigger, DropdownItem, KpiCard, Progress, TablerIcon, TranslatePipe],
  templateUrl: './cards-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsDemo {
  protected readonly kpis: { label: TranslationKey; value: string; icon: TablerIconName; tone: KpiTone; trend: number }[] = [
    { label: 'ui.lists.stat.revenue', value: '$48,210', icon: 'currency-dollar', tone: 'success', trend: 12.4 },
    { label: 'ui.lists.stat.orders', value: '1,284', icon: 'orders', tone: 'primary', trend: 4.1 },
    { label: 'ui.lists.stat.customers', value: '312', icon: 'users', tone: 'info', trend: -2.3 },
    { label: 'ui.cards.kpi.reviews', value: '4.9', icon: 'star', tone: 'warning', trend: 0.8 },
  ];

  protected readonly posts: Post[] = [
    { title: 'ui.cards.post1.title', excerpt: 'ui.cards.post1.excerpt', tag: 'ui.cards.tag.guide', tone: 'primary', icon: 'rocket', gradient: 'from-(--primary-color)/35 to-secondary/30', author: 'Lizeth Juarez', date: '02 nov 2026' },
    { title: 'ui.cards.post2.title', excerpt: 'ui.cards.post2.excerpt', tag: 'ui.cards.tag.design', tone: 'secondary', icon: 'photo', gradient: 'from-accent/40 to-warning/30', author: 'Jaret González', date: '28 oct 2026' },
    { title: 'ui.cards.post3.title', excerpt: 'ui.cards.post3.excerpt', tag: 'ui.cards.tag.news', tone: 'success', icon: 'bolt', gradient: 'from-info/35 to-success/30', author: 'Diego Hernandez', date: '20 oct 2026' },
  ];

  protected readonly tones: { key: string; label: TranslationKey; icon: TablerIconName }[] = [
    { key: 'primary', label: 'ui.tone.primary', icon: 'info-circle' },
    { key: 'success', label: 'ui.tone.success', icon: 'circle-check' },
    { key: 'warning', label: 'ui.tone.warning', icon: 'alert-triangle' },
    { key: 'danger', label: 'ui.tone.danger', icon: 'close' },
  ];

  protected readonly shortcuts: { label: TranslationKey; hint: TranslationKey; icon: TablerIconName; path: string }[] = [
    { label: 'nav.tables', hint: 'ui.cards.short.tables', icon: 'table', path: '/ui/tables' },
    { label: 'nav.forms', hint: 'ui.cards.short.forms', icon: 'forms', path: '/ui/forms' },
    { label: 'nav.modals', hint: 'ui.cards.short.modals', icon: 'app-window', path: '/ui/modals' },
  ];

  protected readonly shipping = signal('standard');
  protected readonly shippingOptions: { key: string; label: TranslationKey; hint: TranslationKey; price: string; icon: TablerIconName }[] = [
    { key: 'standard', label: 'ui.cards.ship.standard', hint: 'ui.cards.ship.standardHint', price: '$0', icon: 'truck' },
    { key: 'express', label: 'ui.cards.ship.express', hint: 'ui.cards.ship.expressHint', price: '$149', icon: 'bolt' },
    { key: 'pickup', label: 'ui.cards.ship.pickup', hint: 'ui.cards.ship.pickupHint', price: '$0', icon: 'stores' },
  ];
}