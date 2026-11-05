import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND, brandLogo } from '@core/config/brand';
import { Theme } from '@core/services/theme';
import { TablerIcon } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TablerIcon, TranslatePipe],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  protected readonly theme = inject(Theme);
  private readonly location = inject(Location);
  protected readonly brand = BRAND;
  protected readonly logo = computed(() => brandLogo(this.theme.isDark()));

  protected goBack(): void {
    this.location.back();
  }
}