import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Network,
  FileText,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  Home: Home,
  Reports: LayoutDashboard,
  Network,
  Documents: FileText,
  Users: User,
};

export function Sidebar() {
  const { config } = useConfig();
  const location = useLocation();
  const navItems = config?.navItems ?? [{ id: 'home', label: 'Home', path: '/' }];

  return (
    <aside className="flex w-14 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.label] ?? Home;
          const isHome = item.path === '/';
          const isActive = isHome && location.pathname === '/';

          if (isHome) {
            return (
              <NavLink
                key={item.id}
                to="/"
                className={cn(
                  'flex items-center justify-center rounded-lg p-2 transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </NavLink>
            );
          }

          return (
            <div
              key={item.id}
              className="flex items-center justify-center rounded-lg p-2 text-slate-400 dark:text-slate-500"
              title={item.label}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
