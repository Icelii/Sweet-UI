import { afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar, AvatarStatus } from '@shared/components/avatar/avatar';
import { Dropdown, DropdownItem, DropdownTrigger } from '@shared/components/dropdown/dropdown';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { daysAgo, formatDay, formatTime } from '../../chat-format';
import { ChatMessage, ChatStore } from '../../chat-store';

type Row =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'message'; id: number; message: ChatMessage; text: string; time: string; first: boolean; last: boolean; bubble: string };

const STATUS_LABELS: Record<AvatarStatus, TranslationKey> = {
  online: 'ui.badge.online',
  away: 'ui.badge.away',
  busy: 'ui.badge.busy',
  offline: 'ui.badge.offline',
};

/** Messages close in time from the same person are grouped into one block. */
const GROUP_GAP_MS = 5 * 60_000;

/**
 * One conversation: header, messages grouped by day and person, typing indicator and composer.
 * Extra header buttons go in the `[chatActions]` slot.
 */
@Component({
  selector: 'app-chat-thread',
  imports: [Avatar, TablerIcon, TranslatePipe, Dropdown, DropdownTrigger, DropdownItem],
  templateUrl: './chat-thread.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col min-h-0' },
})
export class ChatThread {
  protected readonly store = inject(ChatStore);
  private readonly i18n = inject(I18n);

  readonly conversationId = input.required<string>();
  /** Where the back arrow shows: never, only below 1024px, or always (floating chat). */
  readonly back = input<'none' | 'mobile' | 'always'>('none');
  /** Smaller paddings for the floating window. */
  readonly compact = input(false, { transform: booleanAttribute });
  readonly backClick = output<void>();

  protected readonly draft = signal('');
  protected readonly emojis = ['😀', '😂', '😍', '🥳', '👍', '🙏', '🎉', '🔥', '❤️', '😅', '🤔', '✅'];

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly input = viewChild.required<ElementRef<HTMLTextAreaElement>>('input');

  protected readonly conversation = computed(() => this.store.get(this.conversationId()));
  protected readonly statusLabel = computed(() => {
    const contact = this.conversation()?.contact;
    return contact ? STATUS_LABELS[contact.status] : null;
  });

  protected readonly rows = computed<Row[]>(() => {
    const messages = this.conversation()?.messages ?? [];
    const rows: Row[] = [];
    messages.forEach((message, index) => {
      const previous = messages[index - 1];
      const next = messages[index + 1];
      const newDay = !previous || daysAgo(previous.at) !== daysAgo(message.at);
      if (newDay) rows.push({ kind: 'day', id: `day-${message.id}`, label: formatDay(this.i18n, message.at) });
      const first = newDay || !sameGroup(previous, message);
      const last = !next || !sameGroup(message, next) || daysAgo(next.at) !== daysAgo(message.at);
      rows.push({
        kind: 'message',
        id: message.id,
        message,
        text: this.store.text(message),
        time: formatTime(this.i18n, message.at),
        first,
        last,
        bubble: bubbleClass(message.mine, first, last),
      });
    });
    return rows;
  });

  constructor() {
    afterRenderEffect(() => {
      const conversation = this.conversation();
      this.rows();
      const element = this.scroller().nativeElement;
      // Hidden (e.g. the list is showing on a phone): nothing is being read yet.
      if (!element.checkVisibility()) return;
      // Keep the newest message in view.
      element.scrollTop = element.scrollHeight;
      // A conversation on screen has nothing unread.
      if (conversation?.unread) untracked(() => this.store.markRead(conversation.id));
    });

    // A new conversation starts with an empty box.
    effect(() => {
      this.conversationId();
      untracked(() => this.draft.set(''));
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  protected send(): void {
    if (!this.draft().trim()) return;
    this.store.send(this.conversationId(), this.draft());
    this.draft.set('');
    this.input().nativeElement.focus();
  }

  protected addEmoji(emoji: string): void {
    const element = this.input().nativeElement;
    const start = element.selectionStart ?? this.draft().length;
    const end = element.selectionEnd ?? start;
    const value = this.draft();
    this.draft.set(value.slice(0, start) + emoji + value.slice(end));
    // Put the caret after the emoji once the value is rendered.
    setTimeout(() => {
      element.focus();
      element.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }
}

function sameGroup(a: ChatMessage | undefined, b: ChatMessage): boolean {
  return !!a && a.mine === b.mine && b.at.getTime() - a.at.getTime() < GROUP_GAP_MS;
}

/** Bubbles in a group share a flat corner on the sender's side, like most messengers. */
function bubbleClass(mine: boolean, first: boolean, last: boolean): string {
  const color = mine ? 'bg-(--primary-color) text-white' : 'bg-(--button-bg) text-(--text-color)';
  const corners = mine
    ? `${first ? '' : 'rounded-tr-md'} ${last ? '' : 'rounded-br-md'}`
    : `${first ? '' : 'rounded-tl-md'} ${last ? '' : 'rounded-bl-md'}`;
  return `${color} ${corners}`;
}