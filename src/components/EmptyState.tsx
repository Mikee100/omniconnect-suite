import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-12 sm:py-20 px-4 text-center animate-fadeIn',
            className
        )}>
            {Icon && (
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mb-4 animate-scaleIn">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} size="lg" className="tap-target">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
