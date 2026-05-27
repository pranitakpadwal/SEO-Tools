import { cn } from '@/lib/utils/cn';
import type { Severity, MetricStatus } from '@/types/audit';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50',
  warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50',
  error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50',
  neutral: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Severity-specific badge
export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = {
    high: { variant: 'error' as BadgeVariant, label: 'High', dot: '🔴' },
    medium: { variant: 'warning' as BadgeVariant, label: 'Medium', dot: '🟡' },
    low: { variant: 'info' as BadgeVariant, label: 'Low', dot: '🔵' },
  };

  const { variant, label } = config[severity];
  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

// Metric status badge
export function MetricBadge({ status }: { status: MetricStatus }) {
  const config = {
    good: { variant: 'success' as BadgeVariant, label: 'Good' },
    'needs-improvement': { variant: 'warning' as BadgeVariant, label: 'Needs Work' },
    poor: { variant: 'error' as BadgeVariant, label: 'Poor' },
  };

  const { variant, label } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
