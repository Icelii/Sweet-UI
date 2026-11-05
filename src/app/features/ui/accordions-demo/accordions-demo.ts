import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Accordion, AccordionItem } from '@shared/components/accordion/accordion';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-accordions-demo',
  imports: [Accordion, AccordionItem, TablerIcon, TranslatePipe],
  templateUrl: './accordions-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionsDemo {
  protected readonly faq: { q: TranslationKey; a: TranslationKey }[] = [
    { q: 'ui.accordions.faq.q1', a: 'ui.accordions.faq.a1' },
    { q: 'ui.accordions.faq.q2', a: 'ui.accordions.faq.a2' },
    { q: 'ui.accordions.faq.q3', a: 'ui.accordions.faq.a3' },
    { q: 'ui.accordions.faq.q4', a: 'ui.accordions.faq.a4' },
  ];

  protected readonly sections: { title: TranslationKey; subtitle: TranslationKey; icon: TablerIconName; body: TranslationKey; badge?: string }[] = [
    { title: 'ui.tabs.account', subtitle: 'ui.accordions.sec.accountHint', icon: 'user-circle', body: 'ui.accordions.sec.accountBody' },
    { title: 'layout.notifications', subtitle: 'ui.accordions.sec.notifyHint', icon: 'bell', body: 'ui.accordions.sec.notifyBody', badge: '3' },
    { title: 'ui.tabs.billing', subtitle: 'ui.accordions.sec.billingHint', icon: 'credit-card', body: 'ui.tabs.billingBody' },
    { title: 'ui.tabs.security', subtitle: 'ui.accordions.sec.securityHint', icon: 'lock', body: 'ui.tabs.securityBody' },
  ];
}