import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUIStore } from '@/state/uiStore';
import { PageHeader } from '@/components/PageHeader';
import { Palette, User, Bell } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Settings"
        description="Manage your application preferences and configuration"
      />

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the dashboard looks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode theme
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" className="h-11" />
            </div>
            <Button className="shadow-md hover:shadow-lg transition-all">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure notification preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Bookings</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new bookings arrive
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new customer messages
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about system updates
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
