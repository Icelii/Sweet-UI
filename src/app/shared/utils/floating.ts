/** Helpers for dropdown panels (datepicker, select) shown in the browser's top layer. */

export type FloatingWidth = 'anchor' | 'phone' | 'content';

/**
 * Places `panel` under `anchor` (or above it when there is no room), keeping it inside the viewport.
 * - `anchor`: always as wide as the anchor (selects).
 * - `phone`: as wide as the anchor only on screens < 640px (datepicker).
 * - `content`: sized by its own content.
 */
export function positionFloating(panel: HTMLElement, anchor: HTMLElement, width: FloatingWidth = 'content'): void {
  const margin = 8;
  const gap = 6;
  const rect = anchor.getBoundingClientRect();
  const isPhone = window.matchMedia('(max-width: 639px)').matches;
  const matchWidth = width === 'anchor' || (width === 'phone' && isPhone);

  panel.style.width = matchWidth ? `${rect.width}px` : '';
  const size = panel.getBoundingClientRect();

  let left = rect.left;
  if (left + size.width > window.innerWidth - margin) left = rect.right - size.width;
  left = Math.max(margin, left);

  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  let top: number;
  if (size.height + gap <= spaceBelow) top = rect.bottom + gap;
  else if (size.height + gap <= spaceAbove) top = rect.top - gap - size.height;
  else top = Math.max(margin, window.innerHeight - size.height - margin);

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

/**
 * True when a click lands on the <label> of our field (by `for` or by wrapping it).
 * The browser forwards that click to the trigger afterwards; like a native input,
 * it should only focus the field, not open the panel.
 */
export function isOwnLabelClick(event: MouseEvent, host: HTMLElement, inputId: string | null): boolean {
  const target = event.target as Element | null;
  if (!target || host.contains(target)) return false;
  const label = target.closest('label');
  if (!label) return false;
  return (!!inputId && label.htmlFor === inputId) || label.contains(host);
}
export type FloatingPlacement = 'top' | 'bottom' | 'left' | 'right';

const OPPOSITE: Record<FloatingPlacement, FloatingPlacement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Places `panel` on one side of `anchor` (tooltips, popovers). Flips to the other side when it
 * does not fit, and falls back to top/bottom for left/right on narrow screens.
 * Sets `data-placement` and `--arrow-x` / `--arrow-y` so the arrow keeps pointing at the anchor.
 */
export function positionAround(panel: HTMLElement, anchor: HTMLElement, placement: FloatingPlacement, gap = 8): FloatingPlacement {
  const margin = 8;
  const rect = anchor.getBoundingClientRect();
  const size = panel.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fits: Record<FloatingPlacement, boolean> = {
    top: rect.top - gap - size.height >= margin,
    bottom: rect.bottom + gap + size.height <= vh - margin,
    left: rect.left - gap - size.width >= margin,
    right: rect.right + gap + size.width <= vw - margin,
  };

  let side = placement;
  if (!fits[side] && fits[OPPOSITE[side]]) side = OPPOSITE[side];
  if ((side === 'left' || side === 'right') && !fits[side]) side = fits.top || !fits.bottom ? 'top' : 'bottom';

  let left: number;
  let top: number;
  if (side === 'top' || side === 'bottom') {
    left = rect.left + rect.width / 2 - size.width / 2;
    top = side === 'top' ? rect.top - gap - size.height : rect.bottom + gap;
  } else {
    top = rect.top + rect.height / 2 - size.height / 2;
    left = side === 'left' ? rect.left - gap - size.width : rect.right + gap;
  }
  left = Math.min(Math.max(margin, left), Math.max(margin, vw - size.width - margin));
  top = Math.min(Math.max(margin, top), Math.max(margin, vh - size.height - margin));

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.dataset['placement'] = side;
  const clamp = (value: number, max: number) => Math.min(Math.max(value, 12), max - 12);
  panel.style.setProperty('--arrow-x', `${clamp(rect.left + rect.width / 2 - left, size.width)}px`);
  panel.style.setProperty('--arrow-y', `${clamp(rect.top + rect.height / 2 - top, size.height)}px`);
  return side;
}