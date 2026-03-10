import {
  ExternalLink,
  BarChart3,
  Plane,
  LayoutGrid,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';
import type { CardColor } from '@/types/config';
import { cn } from '@/lib/utils';

/** Light: soft tinted surfaces. Dark: deeper tones. Harmonious contrast and hierarchy. */
const CARD_COLOR_CLASSES: Record<
  CardColor,
  { bg: string; border: string; iconBg: string; title: string; description: string; link: string }
> = {
  blue: {
    bg: 'bg-blue-50/90 dark:bg-blue-950/80',
    border: 'border-blue-200/80 dark:border-blue-800/60',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60',
    title: 'text-blue-900 dark:text-blue-100',
    description: 'text-slate-600 dark:text-slate-300',
    link: 'text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200',
  },
  teal: {
    bg: 'bg-teal-50/90 dark:bg-teal-950/80',
    border: 'border-teal-200/80 dark:border-teal-800/60',
    iconBg: 'bg-teal-100 dark:bg-teal-900/60',
    title: 'text-teal-900 dark:text-teal-100',
    description: 'text-slate-600 dark:text-slate-300',
    link: 'text-teal-600 hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200',
  },
  emerald: {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/80',
    border: 'border-emerald-200/80 dark:border-emerald-800/60',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    title: 'text-emerald-900 dark:text-emerald-100',
    description: 'text-slate-600 dark:text-slate-300',
    link: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200',
  },
  amber: {
    bg: 'bg-amber-50/90 dark:bg-amber-950/80',
    border: 'border-amber-200/80 dark:border-amber-800/60',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    title: 'text-amber-900 dark:text-amber-100',
    description: 'text-slate-600 dark:text-slate-300',
    link: 'text-amber-600 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200',
  },
  violet: {
    bg: 'bg-violet-50/90 dark:bg-violet-950/80',
    border: 'border-violet-200/80 dark:border-violet-800/60',
    iconBg: 'bg-violet-100 dark:bg-violet-900/60',
    title: 'text-violet-900 dark:text-violet-100',
    description: 'text-slate-600 dark:text-slate-300',
    link: 'text-violet-600 hover:text-violet-700 dark:text-violet-300 dark:hover:text-violet-200',
  },
};

const CARD_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Plane,
  LayoutGrid,
  Sparkles,
};

function SolutionCard({
  title,
  description,
  url,
  color,
  iconName,
}: {
  title: string;
  description: string;
  url: string;
  color: CardColor;
  iconName?: string;
}) {
  const styles = CARD_COLOR_CLASSES[color];
  const Icon = iconName ? CARD_ICONS[iconName] : null;

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md',
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              styles.iconBg
            )}
          >
            <Icon className={cn('h-5 w-5', styles.title)} />
          </span>
        )}
        <h3 className={cn('font-semibold text-lg', styles.title)}>{title}</h3>
      </div>
      <p className={cn('flex-1 text-sm leading-relaxed', styles.description)}>
        {description}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'mt-4 inline-flex items-center gap-1.5 font-medium text-sm',
          styles.link
        )}
      >
        Open app
        <ExternalLink className="h-4 w-4" />
      </a>
    </article>
  );
}

export function LandingPage() {
  const { config, visibleCardIds, cardUrlOverrides, isLoading, error } = useConfig();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-red-600 dark:text-red-400">
          Failed to load config: {error.message}
        </p>
      </div>
    );
  }

  const cards = config?.cards ?? [];
  const garvCard = cards.find((c) => c.id === 'garv');
  const solutionCards = cards.filter((c) => c.id !== 'garv');
  const visibleCards =
    visibleCardIds === null
      ? solutionCards
      : solutionCards.filter((c) => visibleCardIds.includes(c.id));

  const title = config?.appTitle ?? 'Amadeus Operations Insights and Control';
  const garvUrl = garvCard
    ? cardUrlOverrides[garvCard.id] ?? garvCard.url
    : '';

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden rounded-b-xl border-b border-slate-200 bg-[#E8F3FF]/20 px-6 py-12 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900/95 dark:to-slate-800/95">
        <div className="relative z-10 max-w-4xl">
          <h1 className="font-nunito-sans font-extrabold text-slate-900 text-3xl tracking-tight dark:text-slate-100 md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-slate-700 text-base dark:text-slate-300">
            This portal is powered by <strong className="text-violet-600 dark:text-violet-400">GARV AI</strong>, the universal Airops Assistant that delivers intelligent, AI-powered insights for check-in, turnaround, and resource management.
          </p>
          {garvCard && garvUrl && (
            <p className="mt-4">
              <a
                href={garvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Explore GARV
                <ExternalLink className="h-4 w-4" />
              </a>
            </p>
          )}
        </div>
      </section>

      <div className="px-4 py-8 md:px-6">
        <h2 className="mb-6 font-semibold text-slate-800 text-xl dark:text-slate-200">
          Solutions
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <SolutionCard
              key={card.id}
              title={card.title}
              description={card.description}
              url={cardUrlOverrides[card.id] ?? card.url}
              color={card.color}
              iconName={card.icon}
            />
          ))}
        </div>
        {visibleCards.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">
            No cards visible. Use Settings to choose which solutions to show.
          </p>
        )}
      </div>
    </div>
  );
}
