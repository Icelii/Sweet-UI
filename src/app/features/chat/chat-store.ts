import { computed, inject, Injectable, signal } from '@angular/core';
import { I18n } from '@core/i18n/i18n';
import { TranslationKey } from '@core/i18n/translations';
import { AvatarStatus } from '@shared/components/avatar/avatar';

export interface ChatContact {
  id: string;
  name: string;
  role: TranslationKey;
  status: AvatarStatus;
}

export interface ChatMessage {
  id: number;
  mine: boolean;
  /** Text typed in the app. Sample messages use `key` so they follow the language. */
  text?: string;
  key?: TranslationKey;
  at: Date;
  /** Only for my messages: the other person has seen it. */
  read?: boolean;
}

export interface Conversation {
  id: string;
  contact: ChatContact;
  messages: ChatMessage[];
  unread: number;
  typing: boolean;
}

// --- Sample data: replace it with your API or a WebSocket ---
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000);
const DAY = 24 * 60;

function seed(): Conversation[] {
  let id = 1;
  const them = (key: TranslationKey, ago: number): ChatMessage => ({ id: id++, mine: false, key, at: minutesAgo(ago) });
  const me = (key: TranslationKey, ago: number, read = true): ChatMessage => ({ id: id++, mine: true, key, at: minutesAgo(ago), read });

  return [
    {
      id: 'ana',
      contact: { id: 'ana', name: 'Ana López', role: 'chat.role.design', status: 'online' },
      messages: [
        them('chat.seed.ana1', 52),
        me('chat.seed.ana2', 47),
        them('chat.seed.ana3', 9),
        them('chat.seed.ana4', 8),
      ],
      unread: 2,
      typing: false,
    },
    {
      id: 'carlos',
      contact: { id: 'carlos', name: 'Carlos Méndez', role: 'chat.role.sales', status: 'away' },
      messages: [
        them('chat.seed.carlos1', 190),
        me('chat.seed.carlos2', 182),
        them('chat.seed.carlos3', 175),
      ],
      unread: 0,
      typing: false,
    },
    {
      id: 'sofia',
      contact: { id: 'sofia', name: 'Sofía Ramírez', role: 'chat.role.support', status: 'busy' },
      messages: [
        them('chat.seed.sofia1', DAY + 120),
        me('chat.seed.sofia2', DAY + 112),
        them('chat.seed.sofia3', DAY + 110),
      ],
      unread: 0,
      typing: false,
    },
    {
      id: 'diego',
      contact: { id: 'diego', name: 'Diego Torres', role: 'chat.role.warehouse', status: 'offline' },
      messages: [me('chat.seed.diego1', 2 * DAY + 300), them('chat.seed.diego2', 2 * DAY + 60)],
      unread: 1,
      typing: false,
    },
    {
      id: 'valeria',
      contact: { id: 'valeria', name: 'Valeria Ruiz', role: 'chat.role.marketing', status: 'online' },
      messages: [me('chat.seed.valeria1', 4 * DAY + 200), them('chat.seed.valeria2', 4 * DAY + 185)],
      unread: 0,
      typing: false,
    },
  ];
}

const REPLIES: TranslationKey[] = ['chat.reply.1', 'chat.reply.2', 'chat.reply.3', 'chat.reply.4'];

/** Conversations shared by the chat page and the floating chat. */
@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly i18n = inject(I18n);
  private nextId = 1000;
  private replyIndex = 0;

  private readonly state = signal<Conversation[]>(seed());

  /** Most recent conversation first. */
  readonly conversations = computed(() =>
    [...this.state()].sort((a, b) => lastAt(b) - lastAt(a)),
  );

  readonly unreadTotal = computed(() => this.state().reduce((sum, item) => sum + item.unread, 0));

  get(id: string | null): Conversation | undefined {
    return this.state().find((item) => item.id === id);
  }

  text(message: ChatMessage): string {
    return message.text ?? (message.key ? this.i18n.t(message.key) : '');
  }

  markRead(id: string): void {
    this.patch(id, (item) => (item.unread ? { ...item, unread: 0 } : item));
  }

  send(id: string, text: string): void {
    const value = text.trim();
    if (!value) return;
    this.patch(id, (item) => ({
      ...item,
      messages: [...item.messages, { id: this.nextId++, mine: true, text: value, at: new Date(), read: false }],
    }));
    this.fakeReply(id);
  }

  /** Demo only: the contact reads the message, types and answers. */
  private fakeReply(id: string): void {
    setTimeout(() => this.patch(id, (item) => ({ ...item, typing: true, messages: item.messages.map((m) => (m.mine ? { ...m, read: true } : m)) })), 900);
    setTimeout(() => {
      const key = REPLIES[this.replyIndex++ % REPLIES.length];
      this.patch(id, (item) => ({
        ...item,
        typing: false,
        unread: item.unread + 1,
        messages: [...item.messages, { id: this.nextId++, mine: false, key, at: new Date() }],
      }));
    }, 2600);
  }

  private patch(id: string, change: (item: Conversation) => Conversation): void {
    this.state.update((list) => list.map((item) => (item.id === id ? change(item) : item)));
  }
}

function lastAt(item: Conversation): number {
  return item.messages.at(-1)?.at.getTime() ?? 0;
}