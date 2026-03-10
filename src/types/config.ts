export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export type CardColor = 'blue' | 'teal' | 'emerald' | 'amber' | 'violet';

export interface CardConfig {
  id: string;
  title: string;
  description: string;
  url: string;
  color: CardColor;
  /** Lucide icon name (e.g. BarChart3, Plane, LayoutGrid). Optional. */
  icon?: string;
}

export interface AppConfig {
  appTitle: string;
  customerName: string;
  logoUrl: string;
  navItems: NavItem[];
  cards: CardConfig[];
}

export const CARD_COLORS: CardColor[] = ['blue', 'teal', 'emerald', 'amber', 'violet'];

export interface PortalSettingsOverrides {
  /** Customer/brand name: displayed in header and used for logo fetch (Brandfetch). */
  customerName?: string;
  visibleCardIds?: string[] | null;
  /** Card id -> URL. Only stored when different from config default. */
  cardUrlOverrides?: Record<string, string>;
}

const PORTAL_SETTINGS_KEY = 'portal-settings';

export function loadPortalSettings(): PortalSettingsOverrides {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PORTAL_SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PortalSettingsOverrides;
  } catch {
    return {};
  }
}

export function savePortalSettings(overrides: PortalSettingsOverrides): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(overrides));
}
