import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') return '??';

    const parts = value.trim().split(/\s+/);
    if (parts.length === 0) return '??';

    const firstInitial = parts[0][0];

    let secondInitial = '';

    if (parts.length === 1) {
      secondInitial = parts[0][1] || '';
    } else if (parts.length >= 3) {
      secondInitial = parts[2][0];
    } else {
      secondInitial = parts[1][0];
    }

    return (firstInitial + secondInitial).toUpperCase();
  }
}