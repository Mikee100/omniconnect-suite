import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8', className)}>
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground animate-slideIn">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm sm:text-base text-muted-foreground animate-slideIn">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 sm:gap-3 animate-slideIn">
                    {actions}
                </div>
            )}
        </div>
    );
}
