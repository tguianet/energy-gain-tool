import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  variant?: 'default' | 'energy' | 'gold';
}

export default function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-5 shadow-card transition-all hover:shadow-elevated animate-fade-in',
      variant === 'energy' && 'gradient-energy text-primary-foreground',
      variant === 'gold' && 'gradient-gold text-accent-foreground',
      variant === 'default' && 'bg-card border',
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn(
            'text-sm font-medium',
            variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
          )}>
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              'text-xs font-medium',
              variant === 'default' ? 'text-primary' : 'opacity-90'
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-2.5',
          variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-primary-foreground/20'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
