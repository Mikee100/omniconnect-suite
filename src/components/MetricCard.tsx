import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">{value}</p>
            {trend && (
              <div
                className={cn(
                  'flex items-center text-sm font-semibold',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                <span className="flex items-center gap-1">
                  {trend.isPositive ? '↗' : '↘'}
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="ml-2 text-xs text-muted-foreground font-normal">vs last month</span>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 group-hover:scale-110 transition-transform duration-200 shadow-sm">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
