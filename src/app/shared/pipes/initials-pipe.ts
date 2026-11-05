import { Pipe, PipeTransform } from '@angular/core';

/**
 * Two-letter initials for avatars: first name + first surname ("Ana María López" → "AL"),
 * or the first two letters of a single word. Empty values give "??".
 *
 * {{ user.name | initials }}
 */
@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const parts = typeof value === 'string' ? value.trim().split(/\s+/).filter(Boolean) : [];
    if (!parts.length) return '??';

    const [first] = parts;
    // With three or more words the third one is usually the first surname.
    const second = parts.length === 1 ? (first[1] ?? '') : parts.length >= 3 ? parts[2][0] : parts[1][0];

    return (first[0] + second).toUpperCase();
  }
}
