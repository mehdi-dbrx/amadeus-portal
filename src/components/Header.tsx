import { Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfig } from '@/contexts/ConfigContext';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { config, customerName, logoUrl, isLoading } = useConfig();
  const { resolvedTheme, setTheme } = useTheme();

  const title = config?.appTitle ?? 'Amadeus Operations Insights and Control';

  const initials = (customerName || 'User')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-0 dark:border-slate-800 dark:bg-slate-950'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold tracking-tight text-slate-900 text-base dark:text-slate-100">
          {title}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-3 px-4">
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            className="h-32 w-auto object-contain dark:invert"
          />
        )}
        <span
          className={cn(
            'font-bold text-lg',
            customerName
              ? 'text-slate-500 dark:text-slate-400'
              : 'text-slate-400 dark:text-slate-500',
            isLoading && 'animate-pulse'
          )}
        >
          {customerName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-3 py-1.5 font-medium text-white text-sm shadow-sm">
          <Sparkles className="h-4 w-4" />
          Garv
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              aria-label="User menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
            >
              Toggle {resolvedTheme === 'light' ? 'dark' : 'light'} mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onOpenSettings?.();
              }}
            >
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
