import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useUIStore } from '@/state/uiStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed, theme, setTheme } = useUIStore();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);
  }, []);

  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          // Desktop: adjust margin based on sidebar state
          isDesktop && (sidebarCollapsed ? 'ml-16' : 'ml-64'),
          // Mobile: no left margin (sidebar is overlay)
          !isDesktop && 'ml-0'
        )}
      >
        <Navbar />
        <main className="mt-16 p-4 sm:p-6 lg:p-8 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
