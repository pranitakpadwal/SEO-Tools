import { cn } from '@/lib/utils/cn';
import type { MetricResult } from '@/types/audit';
import { MetricBadge } from '@/components/ui/Badge';

interface MetricCardProps {
  metric: MetricResult;
  label: string;
  icon?: string;
  description?: string;
}

const statusBgClasses = {
  good: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30',
  'needs-improvement': 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30',
  poor: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30',
};

const statusValueClasses = {
  good: 'text-emerald-600 dark:text-emerald-400',
  'needs-improvement': 'text-amber-600 dark:text-amber-400',
  poor: 'text-red-600 dark:text-red-400',
};

export function MetricCard({ metric, label, icon, description }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        statusBgClasses[metric.status]
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <MetricBadge status={metric.status} />
      </div>

      <div className={cn('text-3xl font-bold tabular-nums mt-1', statusValueClasses[metric.status])}>
        {metric.displayValue}
      </div>

      {(description || metric.description) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          {description || metric.description}
        </p>
      )}

      {/* Threshold indicator */}
      <div className="mt-3 pt-3 border-t border-current/10">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Good: ≤{metric.unit === 'ms'
              ? metric.threshold.good >= 1000
                ? `${(metric.threshold.good / 1000).toFixed(1)}s`
                : `${metric.threshold.good}ms`
              : metric.threshold.good}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {`Poor: >`}{metric.unit === 'ms'
              ? metric.threshold.poor >= 1000
                ? `${(metric.threshold.poor / 1000).toFixed(1)}s`
                : `${metric.threshold.poor}ms`
              : metric.threshold.poor}
          </span>
        </div>
      </div>
    </div>
  );
}
