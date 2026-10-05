import { TranslationKey } from "@core/i18n/translations";
import { TablerIconName } from "@shared/components/tabler-icon/tabler-icon";

export interface NavLink {
  label: TranslationKey;
  path: string;
  match?: string[];
}

export interface NavItem extends NavLink {
  icon: TablerIconName;
  children?: NavLink[];
}

export interface NavSection {
  title?: TranslationKey;
  items: NavItem[];
}

export interface FlatNavItem extends NavItem {
  section?: TranslationKey;
}