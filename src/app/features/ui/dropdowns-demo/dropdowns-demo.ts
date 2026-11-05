import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/translations';
import { Avatar } from '@shared/components/avatar/avatar';
import { Dropdown, DropdownItem, DropdownTrigger } from '@shared/components/dropdown/dropdown';
import { TablerIcon, TablerIconName } from '@shared/components/tabler-icon/tabler-icon';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
import { TONES } from '../ui-tones';

interface Column {
  key: string;
  label: TranslationKey;
}

interface FileRow {
  name: string;
  size: string;
  icon: TablerIconName;
}

@Component({
  selector: 'app-dropdowns-demo',
  imports: [Dropdown, DropdownTrigger, DropdownItem, Avatar, TablerIcon, TranslatePipe],
  templateUrl: './dropdowns-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownsDemo {
  protected readonly tones = TONES.slice(0, 6);

  // Last chosen action, to show that items work.
  protected readonly lastAction = signal<TranslationKey | null>(null);

  protected run(action: TranslationKey): void {
    this.lastAction.set(action);
  }

  // Checkable items (stay open)
  protected readonly columns: Column[] = [
    { key: 'customer', label: 'tables.order.customer' },
    { key: 'date', label: 'tables.order.date' },
    { key: 'total', label: 'tables.order.total' },
    { key: 'status', label: 'ui.dropdowns.status' },
  ];
  protected readonly visible = signal<string[]>(['customer', 'date', 'total']);

  protected toggleColumn(key: string): void {
    this.visible.update((list) => (list.includes(key) ? list.filter((item) => item !== key) : [...list, key]));
  }

  // Single choice
  protected readonly sorts: { key: string; label: TranslationKey }[] = [
    { key: 'recent', label: 'ui.dropdowns.sort.recent' },
    { key: 'oldest', label: 'ui.dropdowns.sort.oldest' },
    { key: 'name', label: 'ui.dropdowns.sort.name' },
    { key: 'size', label: 'ui.dropdowns.sort.size' },
  ];
  protected readonly sort = signal('recent');
  protected readonly sortLabel = computed(() => this.sorts.find((item) => item.key === this.sort())!.label);

  // Row actions inside a scrollable table
  protected readonly files: FileRow[] = [
    { name: 'Reporte-ventas-octubre.pdf', size: '2.4 MB', icon: 'file-text' },
    { name: 'Catalogo-otono-2026.zip', size: '48 MB', icon: 'archive' },
    { name: 'Banner-principal.png', size: '860 KB', icon: 'photo' },
  ];
}