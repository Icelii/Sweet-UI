import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { ChatStore } from '@features/chat/chat-store';
import { ChatList } from '@features/chat/components/chat-list/chat-list';
import { ChatThread } from '@features/chat/components/chat-thread/chat-thread';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { filter, map } from 'rxjs';

/**
 * Floating chat button in the corner, like Messenger on Facebook. It opens a small window
 * with the conversations; "expand" moves to the full chat page. Hidden on the chat page itself.
 */
@Component({
  selector: 'app-chat-launcher',
  imports: [ChatList, ChatThread, TablerIcon, TranslatePipe, NgTemplateOutlet],
  templateUrl: './chat-launcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open.set(false)' },
})
export class ChatLauncher {
  protected readonly store = inject(ChatStore);
  private readonly router = inject(Router);

  protected readonly open = signal(false);
  /** Conversation shown in the window; `null` shows the list. */
  protected readonly current = signal<string | null>(null);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly hidden = computed(() => this.url().startsWith('/chat'));

  constructor() {
    // Going to the chat page closes the window.
    effect(() => {
      if (this.hidden()) untracked(() => this.open.set(false));
    });
  }

  protected expand(): void {
    const id = this.current();
    this.open.set(false);
    void this.router.navigate(['/chat'], { queryParams: id ? { c: id } : {} });
  }
}