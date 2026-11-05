import { TestBed } from '@angular/core/testing';
import { I18n } from '@core/i18n/i18n';
import { Pagination } from './pagination';

describe('Pagination', () => {
  async function render(page: number, total: number, pageSize = 10) {
    await TestBed.inject(I18n).ready;
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('pageSize', pageSize);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const pageButtons = () =>
      Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
        .map((button) => button.textContent?.trim() ?? '')
        .filter((text) => text !== '');
    return { fixture, element, pageButtons };
  }

  it('shows every page when there are 7 or fewer', async () => {
    const { pageButtons } = await render(1, 70);
    expect(pageButtons()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('collapses long ranges around the current page', async () => {
    const { element, pageButtons } = await render(10, 200);
    expect(pageButtons()).toEqual(['1', '9', '10', '11', '20']);
    expect(element.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2);
  });

  it('marks the current page', async () => {
    const { element } = await render(3, 70);
    expect(element.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('3');
  });

  it('moves to the clicked page and stays inside the range', async () => {
    const { fixture, element } = await render(1, 30);
    const buttons = element.querySelectorAll<HTMLButtonElement>('button');
    const previous = buttons[0];
    const next = buttons[buttons.length - 1];

    expect(previous.disabled).toBe(true);
    next.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.page()).toBe(2);
  });

  it('shows the range of results', async () => {
    const { element } = await render(2, 24);
    expect(element.textContent).toContain('11–20');
    expect(element.textContent).toContain('24');
  });
});
