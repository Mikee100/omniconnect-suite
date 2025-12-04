import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
    type?: 'card' | 'list' | 'table';
    count?: number;
    className?: string;
}

export function LoadingSkeleton({ type = 'card', count = 3, className }: LoadingSkeletonProps) {
    const skeletons = Array.from({ length: count });

    if (type === 'card') {
        return (
            <div className={cn('grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3', className)}>
                {skeletons.map((_, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-6 animate-pulse">
                        <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                        <div className="h-3 bg-muted rounded w-full mb-2" />
                        <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className={cn('space-y-3', className)}>
                {skeletons.map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/3" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // table type
    return (
        <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
            <div className="divide-y divide-border">
                {/* Header */}
                <div className="bg-muted/50 p-4 flex gap-4">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                </div>
                {/* Rows */}
                {skeletons.map((_, i) => (
                    <div key={i} className="p-4 flex gap-4 bg-card animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
