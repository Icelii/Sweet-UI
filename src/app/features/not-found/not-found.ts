import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Theme } from '@core/services/theme';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  imports: [RouterLink, TablerIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found',
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export class NotFound {
  protected readonly theme = inject(Theme);
  private readonly location = inject(Location);

  protected goBack(): void {
    this.location.back();
  }
}