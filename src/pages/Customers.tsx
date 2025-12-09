import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, Customer } from '../api/customers';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  User,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Filter,
  MoreVertical,
  Plus,
  Download,
  Users,
  BarChart3,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';

type PlatformType = 'all' | 'whatsapp' | 'messenger' | 'instagram' | 'other';

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformType>('all');
  const [aiFilter, setAiFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'active'>('all');

  const platformMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    whatsapp: {
      label: 'WhatsApp',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: <i className="fab fa-whatsapp text-green-500" />,
    },
    messenger: {
      label: 'Messenger',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: <i className="fab fa-facebook-messenger text-blue-500" />,
    },
    instagram: {
      label: 'Instagram',
      color: 'text-pink-600 bg-pink-50 border-pink-200',
      icon: <i className="fab fa-instagram text-pink-500" />,
    },
    other: {
      label: 'Other',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: <User className="h-4 w-4 text-gray-500" />,
    },
  };

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const normalizePlatform = (customer: Customer) => {
    let key = (customer.platform || '').toLowerCase();
    if (!platformMap[key] || key === 'other' || !key) {
      if (customer.email?.includes('@whatsapp.local')) key = 'whatsapp';
      else if (customer.email?.includes('@messenger.local')) key = 'messenger';
      else if (customer.email?.includes('@instagram.local')) key = 'instagram';
      else key = 'other';
    }
    return key;
  };

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    return customers.filter((customer) => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (customer.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // Platform filter
      const platform = normalizePlatform(customer);
      const matchesPlatform = platformFilter === 'all' || platform === platformFilter;

      // AI filter
      const matchesAiFilter = aiFilter === 'all' ||
        (aiFilter === 'active' && customer.aiEnabled) ||
        (aiFilter === 'paused' && !customer.aiEnabled);

      return matchesSearch && matchesPlatform && matchesAiFilter;
    });
  }, [customers, searchTerm, platformFilter, aiFilter]);

  // Group customers by platform
  const groupedCustomers = useMemo(() => {
    return filteredCustomers.reduce((acc, customer) => {
      const platform = normalizePlatform(customer);
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(customer);
      return acc;
    }, {} as Record<string, Customer[]>);
  }, [filteredCustomers]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!customers) return null;
    
    const total = customers.length;
    const aiActive = customers.filter(c => c.aiEnabled).length;
    const whatsapp = customers.filter(c => normalizePlatform(c) === 'whatsapp').length;
    const messenger = customers.filter(c => normalizePlatform(c) === 'messenger').length;
    const instagram = customers.filter(c => normalizePlatform(c) === 'instagram').length;
    const other = customers.filter(c => normalizePlatform(c) === 'other').length;

    return { total, aiActive, whatsapp, messenger, instagram, other };
  }, [customers]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPlatformFilter('all');
    setAiFilter('all');
    setActiveTab('all');
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Error loading customers</h3>
              <p className="text-sm text-red-600 mt-1">Please try again later</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <PageHeader
        title="Customers"
        description="Manage and communicate with your customer base"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2 shadow-sm hover:shadow-md transition-all">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" className="gap-2 shadow-md hover:shadow-lg transition-all">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Customers</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Active</p>
                  <p className="text-3xl font-bold">{stats.aiActive}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 shadow-sm">
                  <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</p>
                  <p className="text-3xl font-bold">{stats.whatsapp}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 shadow-sm">
                  <i className="fab fa-whatsapp text-green-600 dark:text-green-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Engagement Rate</p>
                  <p className="text-3xl font-bold">{Math.round((stats.aiActive / stats.total) * 100)}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 shadow-sm">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="border-border/50 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, phone, or email..."
                className="pl-9 pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Platform Filters */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground mr-2">Platform:</span>
                  {(['all', 'whatsapp', 'messenger', 'instagram', 'other'] as PlatformType[]).map((platform) => {
                    const info = platform === 'all' 
                      ? { label: 'All', color: 'text-foreground bg-muted', icon: null }
                      : platformMap[platform];
                    return (
                      <button
                        key={platform}
                        onClick={() => setPlatformFilter(platform)}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 flex items-center gap-1.5',
                          platformFilter === platform
                            ? platform === 'all'
                              ? 'bg-primary text-white border-primary'
                              : `text-white border-transparent ${platform === 'whatsapp' ? 'bg-green-500' : platform === 'messenger' ? 'bg-blue-500' : platform === 'instagram' ? 'bg-pink-500' : 'bg-gray-500'}`
                            : 'bg-background text-foreground border-border hover:bg-muted'
                        )}
                      >
                        {info.icon}
                        {platform === 'all' ? 'All Platforms' : info.label}
                      </button>
                    );
                  })}
                </div>

                {/* AI Status Filter */}
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-xs font-medium text-muted-foreground mr-2">AI Status:</span>
                  {(['all', 'active', 'paused'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setAiFilter(status)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200',
                        aiFilter === status
                          ? status === 'active'
                            ? 'bg-green-500 text-white border-green-500'
                            : status === 'paused'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-primary text-white border-primary'
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      )}
                    >
                      {status === 'all' ? 'All Status' : status === 'active' ? 'AI Active' : 'AI Paused'}
                    </button>
                  ))}
                </div>
              </div>

              {(searchTerm || platformFilter !== 'all' || aiFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Customer Directory
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-auto"
              >
                <TabsList className="h-9">
                  <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                  <TabsTrigger value="recent" className="text-xs px-3">Recent</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs px-3">Most Active</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">No customers found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search or filters' : 'Start by adding your first customer'}
              </p>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>AI Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const platform = normalizePlatform(customer);
                    const platformInfo = platformMap[platform];
                    
                    return (
                      <TableRow
                        key={customer.id}
                        className="group hover:bg-muted/50 transition-all duration-200 cursor-pointer hover:shadow-sm"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {getInitials(customer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {customer.name || 'Unknown Customer'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Customer ID: {customer.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-foreground">{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-foreground truncate max-w-[160px]">
                                  {customer.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1.5 px-2.5 py-1 border ${platformInfo.color}`}
                          >
                            {platformInfo.icon}
                            <span className="text-xs font-medium">{platformInfo.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={customer.aiEnabled ? 'default' : 'secondary'}
                            className={cn(
                              'gap-1.5 px-2.5 py-1',
                              customer.aiEnabled
                                ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
                            )}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${customer.aiEnabled ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                            {customer.aiEnabled ? 'AI Active' : 'AI Paused'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/customers/${customer.id}`);
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Send message</DropdownMenuItem>
                                <DropdownMenuItem>View conversation</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Archive customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      {stats && filteredCustomers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Filtered Results</p>
                  <p className="text-lg font-semibold mt-1">{filteredCustomers.length} customers</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">AI Engagement</p>
                  <p className="text-lg font-semibold mt-1">
                    {Math.round((filteredCustomers.filter(c => c.aiEnabled).length / filteredCustomers.length) * 100)}%
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Top Platform</p>
                  <p className="text-lg font-semibold mt-1">
                    {(() => {
                      const platforms = Object.keys(groupedCustomers);
                      if (platforms.length === 0) return 'N/A';
                      const topPlatform = platforms.reduce((a, b) => 
                        groupedCustomers[a].length > groupedCustomers[b].length ? a : b
                      );
                      return platformMap[topPlatform].label;
                    })()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Customers;