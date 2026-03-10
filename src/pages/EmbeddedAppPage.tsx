import { useSearchParams } from 'react-router-dom';

export function EmbeddedAppPage() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');

  if (!url) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <p className="text-slate-500 dark:text-slate-400">No URL provided.</p>
      </div>
    );
  }

  try {
    new URL(url);
  } catch {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <p className="text-slate-500 dark:text-slate-400">Invalid URL.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <iframe
        src={url}
        title="Card app"
        className="min-h-0 w-full flex-1 border-0"
        style={{ minHeight: '60vh' }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
