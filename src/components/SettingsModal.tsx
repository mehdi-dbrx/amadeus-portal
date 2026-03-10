import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useConfig } from '@/contexts/ConfigContext';
import type { PortalSettingsOverrides } from '@/types/config';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SOLUTION_CARDS_FILTER = (c: { id: string }) => c.id !== 'garv';
const BRAND_API = '/api/brand';
const AIRLINES_URL = '/data/airlines.txt';

type FetchLogoStatus = 'idle' | 'loading' | 'ok' | 'ko';

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { config, customerName, visibleCardIds, cardUrlOverrides, updateOverrides } = useConfig();
  const [localCustomerName, setLocalCustomerName] = useState(customerName);
  const [fetchLogoStatus, setFetchLogoStatus] = useState<FetchLogoStatus>('idle');
  const [fetchLogoError, setFetchLogoError] = useState<string | null>(null);
  const [airlines, setAirlines] = useState<string[]>([]);
  const [tabCompletionIndex, setTabCompletionIndex] = useState(0);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const suggestionsCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const solutionCards = (config?.cards ?? []).filter(SOLUTION_CARDS_FILTER);
  const allCardIds = solutionCards.map((c) => c.id);
  const hiddenCardIds = visibleCardIds === null
    ? new Set<string>()
    : new Set(allCardIds.filter((id) => !visibleCardIds.includes(id)));

  const [localHidden, setLocalHidden] = useState<Set<string>>(hiddenCardIds);
  const [localCardUrls, setLocalCardUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setLocalCustomerName(customerName);
      setFetchLogoStatus('idle');
      setFetchLogoError(null);
      setTabCompletionIndex(0);
      setLocalHidden(hiddenCardIds);
      const urls: Record<string, string> = {};
      solutionCards.forEach((c) => {
        urls[c.id] = cardUrlOverrides[c.id] ?? c.url;
      });
      setLocalCardUrls(urls);
      fetch(AIRLINES_URL)
        .then((res) => (res.ok ? res.text() : Promise.reject(new Error('Failed to load airlines'))))
        .then((text) => {
          const list = text
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean);
          setAirlines(list);
        })
        .catch(() => setAirlines([]));
    }
  }, [open, customerName, visibleCardIds, cardUrlOverrides, config?.cards]);

  const airlineMatches = useMemo(() => {
    const q = localCustomerName.trim().toLowerCase();
    if (!q) return [];
    return airlines.filter((a) => a.toLowerCase().startsWith(q)).slice(0, 20);
  }, [airlines, localCustomerName]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [airlineMatches]);

  useEffect(() => {
    return () => {
      if (suggestionsCloseTimerRef.current) clearTimeout(suggestionsCloseTimerRef.current);
    };
  }, []);

  const selectSuggestion = (name: string) => {
    setLocalCustomerName(name);
    setSuggestionsOpen(false);
    setTabCompletionIndex(0);
  };

  const handleCustomerNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (airlineMatches.length === 0) {
      if (e.key === 'Tab') return;
      setSuggestionsOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const idx = tabCompletionIndex % airlineMatches.length;
      selectSuggestion(airlineMatches[idx]);
      setTabCompletionIndex((prev) => prev + 1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = Math.max(0, Math.min(highlightedIndex, airlineMatches.length - 1));
      selectSuggestion(airlineMatches[idx]);
      return;
    }
    if (e.key === 'Escape') {
      setSuggestionsOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % airlineMatches.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + airlineMatches.length) % airlineMatches.length);
      return;
    }
  };

  const allVisible = localHidden.size === 0;

  const handleToggleCard = (id: string) => {
    setLocalHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setLocalHidden(new Set());
  };

  const handleFetchLogo = async () => {
    const name = localCustomerName.trim();
    if (!name) {
      setFetchLogoStatus('ko');
      setFetchLogoError('Enter a customer name first');
      return;
    }
    setFetchLogoStatus('loading');
    setFetchLogoError(null);
    try {
      const res = await fetch(`${BRAND_API}?name=${encodeURIComponent(name)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.logoUrl) {
        setFetchLogoStatus('ok');
      } else {
        setFetchLogoStatus('ko');
        setFetchLogoError(data.error || `Request failed (${res.status})`);
      }
    } catch (err) {
      setFetchLogoStatus('ko');
      setFetchLogoError(err instanceof Error ? err.message : 'Network error');
    }
  };

  const handleSave = () => {
    const cardUrlOverrides: Record<string, string> = {};
    solutionCards.forEach((c) => {
      const value = (localCardUrls[c.id] ?? c.url).trim();
      if (value && value !== c.url) cardUrlOverrides[c.id] = value;
    });
    const overrides: PortalSettingsOverrides = {
      customerName: localCustomerName.trim() || undefined,
      visibleCardIds:
        localHidden.size === 0 ? null : allCardIds.filter((id) => !localHidden.has(id)),
      cardUrlOverrides: Object.keys(cardUrlOverrides).length > 0 ? cardUrlOverrides : undefined,
    };
    updateOverrides(overrides);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customise the landing page. Changes are saved in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 overflow-y-auto min-h-0">
          <div className="grid gap-2">
            <label
              htmlFor="customer-name"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Customer name
            </label>
            <div className="relative">
              <input
                id="customer-name"
                type="text"
                value={localCustomerName}
                onChange={(e) => {
                  setLocalCustomerName(e.target.value);
                  setTabCompletionIndex(0);
                  setSuggestionsOpen(true);
                  setFetchLogoStatus('idle');
                  setFetchLogoError(null);
                }}
                onFocus={() => {
                  if (suggestionsCloseTimerRef.current) {
                    clearTimeout(suggestionsCloseTimerRef.current);
                    suggestionsCloseTimerRef.current = null;
                  }
                  if (airlineMatches.length > 0) setSuggestionsOpen(true);
                }}
                onBlur={() => {
                  suggestionsCloseTimerRef.current = setTimeout(() => setSuggestionsOpen(false), 150);
                }}
                onKeyDown={handleCustomerNameKeyDown}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="e.g. Amadeus (Tab to complete from airlines)"
                autoComplete="off"
              />
              {suggestionsOpen && airlineMatches.length > 0 && (
                <ul
                  className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  role="listbox"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {airlineMatches.map((name, i) => (
                    <li
                      key={name}
                      role="option"
                      aria-selected={i === highlightedIndex}
                      className={cn(
                        'cursor-pointer px-3 py-2 text-sm',
                        i === highlightedIndex
                          ? 'bg-slate-100 dark:bg-slate-700'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                        'text-slate-900 dark:text-slate-100'
                      )}
                      onMouseDown={() => selectSuggestion(name)}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-slate-500 text-xs dark:text-slate-400">
              Displayed in the header and used to fetch the logo via Brandfetch. Fetch to check before saving.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleFetchLogo}
                disabled={fetchLogoStatus === 'loading'}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {fetchLogoStatus === 'loading' ? 'Fetching…' : 'Fetch logo'}
              </button>
              {fetchLogoStatus === 'ok' && (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">OK</span>
              )}
              {fetchLogoStatus === 'ko' && (
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                  KO{fetchLogoError ? ` — ${fetchLogoError}` : ''}
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Visible cards
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                {allVisible ? 'Show all' : 'Reset to all'}
              </button>
            </div>
            <p className="text-slate-500 text-xs dark:text-slate-400">
              {allVisible
                ? 'All cards are visible. Uncheck to hide specific cards.'
                : 'Checked cards are visible on the landing page.'}
            </p>
            <div className="flex flex-col gap-2">
              {solutionCards.map((card) => {
                const checked = !localHidden.has(card.id);
                return (
                  <label
                    key={card.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors',
                      'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCard(card.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {card.title}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Card URLs
            </label>
            <p className="text-slate-500 text-xs dark:text-slate-400">
              Set the URL each card links to (e.g. Databricks app). Leave as default or change per card.
            </p>
            <div className="flex flex-col gap-3">
              {solutionCards.map((card) => (
                <div key={card.id} className="grid gap-1.5">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {card.title}
                  </span>
                  <input
                    type="url"
                    value={localCardUrls[card.id] ?? card.url}
                    onChange={(e) =>
                      setLocalCardUrls((prev) => ({
                        ...prev,
                        [card.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder={card.url}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
