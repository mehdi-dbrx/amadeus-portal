import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AppConfig } from '@/types/config';
import {
  loadPortalSettings,
  savePortalSettings,
  type PortalSettingsOverrides,
} from '@/types/config';

interface ConfigContextType {
  config: AppConfig | null;
  isLoading: boolean;
  error: Error | null;
  /** Customer name (also used as brand name for logo fetch). */
  customerName: string;
  /** Logo URL from Brandfetch when customerName is set; null while loading or on error. */
  customerLogoUrl: string | null;
  /** Resolved logo for UI: customerLogoUrl from Brandfetch, else config.logoUrl. */
  logoUrl: string;
  visibleCardIds: string[] | null;
  /** Card id -> URL override (from settings). Use with config card url as fallback. */
  cardUrlOverrides: Record<string, string>;
  updateOverrides: (overrides: PortalSettingsOverrides) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const CONFIG_URL = '/config.json';
const BRAND_API = '/api/brand';

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [overrides, setOverrides] = useState<PortalSettingsOverrides>(() =>
    typeof window !== 'undefined' ? loadPortalSettings() : {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [customerLogoUrl, setCustomerLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(CONFIG_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
        return res.json();
      })
      .then((data: AppConfig) => {
        if (!cancelled) {
          setConfig(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const customerNameTrimmed = (overrides.customerName ?? config?.customerName ?? '').trim();

  useEffect(() => {
    if (!customerNameTrimmed) {
      setCustomerLogoUrl(null);
      return;
    }
    let cancelled = false;
    setCustomerLogoUrl(null);
    const url = `${BRAND_API}?name=${encodeURIComponent(customerNameTrimmed)}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Brand fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data: { logoUrl?: string }) => {
        if (!cancelled && data.logoUrl) setCustomerLogoUrl(data.logoUrl);
      })
      .catch(() => {
        if (!cancelled) setCustomerLogoUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [customerNameTrimmed]);

  const updateOverrides = useCallback((next: PortalSettingsOverrides) => {
    setOverrides((prev) => {
      const merged = { ...prev, ...next };
      if (typeof window !== 'undefined') savePortalSettings(merged);
      return merged;
    });
  }, []);

  const customerName =
    overrides.customerName ?? config?.customerName ?? '';
  const visibleCardIds = overrides.visibleCardIds ?? null;
  const cardUrlOverrides = overrides.cardUrlOverrides ?? {};
  const logoUrl = customerLogoUrl ?? config?.logoUrl ?? '';

  const value: ConfigContextType = {
    config,
    isLoading,
    error,
    customerName,
    customerLogoUrl,
    logoUrl,
    visibleCardIds,
    cardUrlOverrides,
    updateOverrides,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (ctx === undefined) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return ctx;
}
