import { TestBed } from '@angular/core/testing';
import { I18n } from '@core/i18n/i18n';
import { ChatStore } from './chat-store';

describe('ChatStore', () => {
  let store: ChatStore;

  beforeEach(async () => {
    await TestBed.inject(I18n).ready;
    store = TestBed.inject(ChatStore);
  });

  afterEach(() => vi.useRealTimers());

  it('lists the most recent conversation first', () => {
    const [first, second] = store.conversations();
    expect(first.messages.at(-1)!.at.getTime()).toBeGreaterThanOrEqual(second.messages.at(-1)!.at.getTime());
  });

  it('adds up the unread messages', () => {
    const total = store.conversations().reduce((sum, item) => sum + item.unread, 0);
    expect(store.unreadTotal()).toBe(total);
  });

  it('clears the unread count of a conversation', () => {
    const id = store.conversations().find((item) => item.unread > 0)!.id;
    store.markRead(id);
    expect(store.get(id)!.unread).toBe(0);
  });

  it('sends a message and moves the conversation to the top', () => {
    vi.useFakeTimers();
    const last = store.conversations().at(-1)!;

    store.send(last.id, '  Hola  ');

    expect(store.conversations()[0].id).toBe(last.id);
    expect(store.text(store.get(last.id)!.messages.at(-1)!)).toBe('Hola');
  });

  it('ignores empty messages', () => {
    const id = store.conversations()[0].id;
    const count = store.get(id)!.messages.length;
    store.send(id, '   ');
    expect(store.get(id)!.messages).toHaveLength(count);
  });

  it('shows the contact typing and then their reply (demo)', () => {
    vi.useFakeTimers();
    const id = store.conversations()[0].id;
    store.markRead(id);
    store.send(id, 'Hola');

    vi.advanceTimersByTime(1000);
    expect(store.get(id)!.typing).toBe(true);
    expect(store.get(id)!.messages.at(-1)!.read).toBe(true);

    vi.advanceTimersByTime(2000);
    const conversation = store.get(id)!;
    expect(conversation.typing).toBe(false);
    expect(conversation.messages.at(-1)!.mine).toBe(false);
    expect(conversation.unread).toBe(1);
  });
});
