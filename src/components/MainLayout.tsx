import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SettingsModal } from '@/components/SettingsModal';

export function MainLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-white/70 dark:bg-slate-950/95">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-h-0 min-w-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
