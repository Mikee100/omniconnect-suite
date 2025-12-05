import { NavLink } from '@/components/NavLink';
import { useUIStore } from '@/state/uiStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Phone,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Instagram,
  BarChart,
  Package,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'WhatsApp', href: '/whatsapp', icon: Phone },
  { name: 'Instagram', href: '/instagram', icon: Instagram },
  { name: 'Packages', href: '/packages', icon: Package },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
  { name: 'AI Performance', href: '/ai-performance', icon: BarChart },
  { name: 'AI Test Chat', href: '/ai-test-chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, mobileMenuOpen, toggleSidebar, setMobileMenuOpen, setSidebarCollapsed } = useUIStore();
  const isDesktop = useIsDesktop();

  // Auto-collapse sidebar on mobile, expand on desktop
  useEffect(() => {
    if (isDesktop) {
      setSidebarCollapsed(false);
      setMobileMenuOpen(false);
    } else {
      setSidebarCollapsed(true);
    }
  }, [isDesktop, setSidebarCollapsed, setMobileMenuOpen]);

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    if (!isDesktop) {
      setMobileMenuOpen(false);
    }
  };

  // Determine if sidebar should be shown
  const showSidebar = isDesktop || mobileMenuOpen;

  return (
    <>
      {/* Backdrop for mobile */}
      {mobileMenuOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40',
          // Desktop behavior
          isDesktop && (sidebarCollapsed ? 'w-16' : 'w-48'),
          // Mobile behavior
          !isDesktop && 'w-48',
          !isDesktop && (showSidebar ? 'translate-x-0' : '-translate-x-full'),
          // Shadow for mobile overlay
          !isDesktop && 'shadow-xl'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Admin
              </h1>
            </div>
          )}

          {isDesktop ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn("ml-auto tap-target transition-transform hover:scale-110", sidebarCollapsed && "mx-auto")}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="ml-auto tap-target"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-custom" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={handleLinkClick}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all tap-target no-select',
                'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                sidebarCollapsed && isDesktop && 'justify-center'
              )}
              activeClassName="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-l-4 border-primary shadow-sm"
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                sidebarCollapsed && isDesktop && "h-6 w-6"
              )} />
              {!sidebarCollapsed && (
                <span className="animate-fadeIn">{item.name}</span>
              )}
              {sidebarCollapsed && isDesktop && (
                <span className="absolute left-full ml-6 px-2 py-1 bg-popover text-popover-foreground rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-border">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer - User info or branding could go here */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border">
              <div className="text-xs text-muted-foreground text-center animate-fadeIn">
                © {new Date().getFullYear()} Business Admin
              </div>
          </div>
        )}
      </aside>
    </>
  );
}
