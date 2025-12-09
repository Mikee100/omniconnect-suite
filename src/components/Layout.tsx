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
    <div className="min-h-screen w-full bg-background flex overflow-x-hidden">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-[margin-left] duration-300 ease-in-out",
        isDesktop && (sidebarCollapsed ? "ml-16" : "ml-48"),
        !isDesktop && "ml-0"
      )}>
        <Navbar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-fadeIn w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
