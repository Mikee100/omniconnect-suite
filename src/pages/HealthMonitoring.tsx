import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Server, Wifi, WifiOff, CheckCircle2, XCircle, AlertCircle, RefreshCw, Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface HealthStatus {
  status: 'up' | 'down';
  info?: Record<string, any>;
  error?: string;
  message?: string;
}

interface HealthResponse {
  status: 'ok' | 'error';
  info: Record<string, HealthStatus>;
  error?: Record<string, HealthStatus>;
  details?: Record<string, any>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchHealthStatus = async (endpoint: string): Promise<HealthResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api${endpoint}`);
    return response.data;
  } catch (error: any) {
    // Handle 404 errors gracefully - endpoint might not be available in all environments
    if (error.response?.status === 404) {
      // Return a default response indicating the endpoint is not available
      return {
        status: 'error',
        info: {},
        error: {
          endpoint: {
            status: 'down',
            message: 'Health monitoring endpoint not available',
            error: 'Endpoint not found (404)'
          }
        }
      };
    }
    // Re-throw other errors
    throw error;
  }
};

export default function HealthMonitoring() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Detailed health check
  const { data: detailedHealth, isLoading, refetch, error } = useQuery({
    queryKey: ['health-detailed'],
    queryFn: () => fetchHealthStatus('/health/detailed'),
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds if enabled
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors - endpoint is not available
      if (error?.response?.status === 404) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: 1000,
    // Suppress error logging for 404s to prevent console spam
    onError: (error: any) => {
      if (error?.response?.status !== 404) {
        console.error('Health check error:', error);
      }
    },
  });

  useEffect(() => {
    if (detailedHealth) {
      setLastUpdate(new Date());
    }
  }, [detailedHealth]);

  const getStatusIcon = (status: 'up' | 'down' | undefined) => {
    if (status === 'up') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (status === 'down') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusBadge = (status: 'up' | 'down' | undefined) => {
    if (status === 'up') {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Healthy</Badge>;
    } else if (status === 'down') {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Unhealthy</Badge>;
    }
    return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Unknown</Badge>;
  };

  const getServiceStatus = (serviceName: string): HealthStatus | null => {
    if (!detailedHealth) return null;
    
    const info = detailedHealth.info?.[serviceName];
    const error = detailedHealth.error?.[serviceName];
    
    if (info) {
      return { status: 'up', ...info };
    }
    if (error) {
      return { status: 'down', ...error };
    }
    return null;
  };

  const overallStatus = detailedHealth?.status === 'ok' ? 'up' : 'down';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            System Health Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of system components and external services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            Overall System Status
          </CardTitle>
          <CardDescription>
            Current health status of all monitored services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusBadge(overallStatus)}
              <span className="text-sm text-muted-foreground">
                {overallStatus === 'up' ? 'All systems operational' : 'Some systems experiencing issues'}
              </span>
            </div>
            {error && (
              <Badge variant="destructive">Failed to fetch health status</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Core Services */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const dbStatus = getServiceStatus('database');
              return (
                <>
                  <div className="flex items-center justify-between">
                    {getStatusIcon(dbStatus?.status)}
                    {getStatusBadge(dbStatus?.status)}
                  </div>
                  {dbStatus?.message && (
                    <p className="text-sm text-muted-foreground">{dbStatus.message}</p>
                  )}
                  {dbStatus?.info?.userCount !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Users: </span>
                      <span className="font-medium">{dbStatus.info.userCount}</span>
                    </div>
                  )}
                  {dbStatus?.error && (
                    <p className="text-sm text-red-500">{dbStatus.error}</p>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Redis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Redis Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const redisStatus = getServiceStatus('redis');
              return (
                <>
                  <div className="flex items-center justify-between">
                    {getStatusIcon(redisStatus?.status)}
                    {getStatusBadge(redisStatus?.status)}
                  </div>
                  {redisStatus?.message && (
                    <p className="text-sm text-muted-foreground">{redisStatus.message}</p>
                  )}
                  {redisStatus?.info?.ping && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Ping: </span>
                      <span className="font-medium">{redisStatus.info.ping}</span>
                    </div>
                  )}
                  {redisStatus?.error && (
                    <p className="text-sm text-red-500">{redisStatus.error}</p>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>Memory and storage usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const memoryHeap = getServiceStatus('memory_heap');
            const memoryRss = getServiceStatus('memory_rss');
            const storage = getServiceStatus('storage');
            
            return (
              <div className="grid gap-4 md:grid-cols-3">
                {/* Memory Heap */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Heap Memory</span>
                    {getStatusIcon(memoryHeap?.status)}
                  </div>
                  {memoryHeap?.info?.used !== undefined && memoryHeap?.info?.total !== undefined && (
                    <>
                      <Progress 
                        value={(memoryHeap.info.used / memoryHeap.info.total) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(memoryHeap.info.used / 1024 / 1024)}MB / {Math.round(memoryHeap.info.total / 1024 / 1024)}MB
                      </div>
                    </>
                  )}
                </div>

                {/* Memory RSS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">RSS Memory</span>
                    {getStatusIcon(memoryRss?.status)}
                  </div>
                  {memoryRss?.info?.used !== undefined && memoryRss?.info?.total !== undefined && (
                    <>
                      <Progress 
                        value={(memoryRss.info.used / memoryRss.info.total) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(memoryRss.info.used / 1024 / 1024)}MB / {Math.round(memoryRss.info.total / 1024 / 1024)}MB
                      </div>
                    </>
                  )}
                </div>

                {/* Storage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Disk Storage</span>
                    {getStatusIcon(storage?.status)}
                  </div>
                  {storage?.info?.used !== undefined && storage?.info?.total !== undefined && (
                    <>
                      <Progress 
                        value={(storage.info.used / storage.info.total) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(storage.info.used / 1024 / 1024 / 1024)}GB / {Math.round(storage.info.total / 1024 / 1024 / 1024)}GB
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* External Services */}
      <Card>
        <CardHeader>
          <CardTitle>External Services</CardTitle>
          <CardDescription>Third-party API connectivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* WhatsApp */}
            {(() => {
              const whatsappStatus = getServiceStatus('whatsapp');
              return (
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">WhatsApp API</span>
                    </div>
                    {getStatusIcon(whatsappStatus?.status)}
                  </div>
                  {getStatusBadge(whatsappStatus?.status)}
                  {whatsappStatus?.message && (
                    <p className="text-sm text-muted-foreground">{whatsappStatus.message}</p>
                  )}
                  {whatsappStatus?.info?.configured === false && (
                    <p className="text-xs text-yellow-500">Not configured</p>
                  )}
                </div>
              );
            })()}

            {/* OpenAI */}
            {(() => {
              const openaiStatus = getServiceStatus('openai');
              return (
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">OpenAI API</span>
                    </div>
                    {getStatusIcon(openaiStatus?.status)}
                  </div>
                  {getStatusBadge(openaiStatus?.status)}
                  {openaiStatus?.message && (
                    <p className="text-sm text-muted-foreground">{openaiStatus.message}</p>
                  )}
                  {openaiStatus?.info?.configured === false && (
                    <p className="text-xs text-yellow-500">Not configured</p>
                  )}
                </div>
              );
            })()}

            {/* Google Calendar */}
            {(() => {
              const googleStatus = getServiceStatus('google_calendar');
              return (
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Google Calendar</span>
                    </div>
                    {getStatusIcon(googleStatus?.status)}
                  </div>
                  {getStatusBadge(googleStatus?.status)}
                  {googleStatus?.message && (
                    <p className="text-sm text-muted-foreground">{googleStatus.message}</p>
                  )}
                  {googleStatus?.info?.configured === false && (
                    <p className="text-xs text-yellow-500">Not configured</p>
                  )}
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && !detailedHealth && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading health status...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

