import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dropdown, DropdownItem, DropdownTrigger } from '@shared/components/dropdown/dropdown';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { ChatStore } from './chat-store';
import { ChatList } from './components/chat-list/chat-list';
import { ChatThread } from './components/chat-thread/chat-thread';

/**
 * Messenger-style page: conversations on the left, the open one on the right.
 * On phones it shows one at a time. `/chat?c=ana` opens a conversation directly.
 */
@Component({
  selector: 'app-chat',
  imports: [ChatList, ChatThread, TablerIcon, TranslatePipe, Dropdown, DropdownTrigger, DropdownItem],
  templateUrl: './chat.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class Chat {
  private readonly store = inject(ChatStore);

  /** What the person picked; `null` on phones means "show the list". */
  protected readonly selected = signal<string | null>(inject(ActivatedRoute).snapshot.queryParamMap.get('c'));
  /** Two columns from 1024px. The server renders the desktop layout. */
  private readonly desktop = signal(true);
  /** On desktop there is always an open conversation; on phones only the one picked. */
  protected readonly active = computed(() => this.selected() ?? (this.desktop() ? (this.store.conversations()[0]?.id ?? null) : null));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const query = window.matchMedia('(min-width: 1024px)');
      const update = () => this.desktop.set(query.matches);
      update();
      query.addEventListener('change', update);
      destroyRef.onDestroy(() => query.removeEventListener('change', update));
    });
  }
}