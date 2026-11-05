import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Swaps any broken <img> for a placeholder. Applies to every <img> in a component
 * that imports it; pass `fallbackSrc` to use another image.
 *
 * <img [src]="user.photo" fallbackSrc="/avatar.png" alt="" />
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- Applies to every <img> on purpose.
  selector: 'img',
  host: { '(error)': 'onError()' },
})
export class FallbackImage {
  private readonly image = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  readonly fallbackSrc = input('https://placehold.net/default.png');

  protected onError(): void {
    if (this.image.src !== this.fallbackSrc()) this.image.src = this.fallbackSrc();
  }
}
