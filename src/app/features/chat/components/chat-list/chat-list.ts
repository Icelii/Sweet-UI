import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { I18n } from '@core/i18n/i18n';
import { Avatar } from '@shared/components/avatar/avatar';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { formatListDate } from '../../chat-format';
import { ChatStore } from '../../chat-store';

/** Searchable list of conversations with the last message, time and unread count. */
@Component({
  selector: 'app-chat-list',
  imports: [Avatar, TablerIcon, TranslatePipe],
  templateUrl: './chat-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col min-h-0' },
})
export class ChatList {
  protected readonly store = inject(ChatStore);
  private readonly i18n = inject(I18n);

  readonly selectedId = input<string | null>(null);
  readonly conversationSelect = output<string>();

  protected readonly query = signal('');

  protected readonly items = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.store
      .conversations()
      .filter((item) => !query || item.contact.name.toLowerCase().includes(query))
      .map((item) => {
        const last = item.messages.at(-1);
        return {
          item,
          preview: last ? (last.mine ? `${this.i18n.t('chat.you')}: ` : '') + this.store.text(last) : '',
          date: last ? formatListDate(this.i18n, last.at) : '',
        };
      });
  });
}