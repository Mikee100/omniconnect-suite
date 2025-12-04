import { useAuthStore } from '@/state/authStore';
import { useUIStore } from '@/state/uiStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, LogOut, User, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, sidebarCollapsed, setMobileMenuOpen } = useUIStore();
  const isDesktop = useIsDesktop();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/notifications/unread-count`);
        const data = await response.json();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'AU';

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300',
        isDesktop ? (sidebarCollapsed ? 'left-16' : 'left-64') : 'left-0'
      )}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left side - Hamburger (mobile) or Title */}
        <div className="flex items-center gap-3">
          {!isDesktop && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="tap-target -ml-2"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            Business Automation
          </h2>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <Link to="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground tap-target transition-all hover:scale-110"
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 min-w-5 px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-semibold animate-scaleIn"
                  variant="default"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground tap-target transition-all hover:scale-110 hover:rotate-12"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 transition-transform" />
            ) : (
              <Sun className="h-5 w-5 transition-transform" />
            )}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full tap-target group">
                <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-scaleIn">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer tap-target">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive cursor-pointer tap-target"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
