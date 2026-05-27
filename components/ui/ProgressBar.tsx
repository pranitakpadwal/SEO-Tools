'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  colorClass?: string;
  animated?: boolean;
  label?: string;
  showValue?: boolean;
  height?: 'xs' | 'sm' | 'md';
}

export function ProgressBar({
  value,
  className,
  colorClass,
  animated = true,
  label,
  showValue = false,
  height = 'sm',
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(Math.max(0, Math.min(100, value))), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(Math.max(0, Math.min(100, value)));
    }
  }, [value, animated]);

  const heightClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
  };

  // Auto color based on value if no colorClass provided
  const autoColor = !colorClass
    ? value >= 75
      ? 'bg-emerald-500'
      : value >= 50
      ? 'bg-amber-500'
      : 'bg-red-500'
    : colorClass;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(value)}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden',
          heightClasses[height]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            autoColor
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// Score-specific progress bar with label
interface ScoreBarProps {
  label: string;
  score: number;
  weight?: string;
  className?: string;
}

export function ScoreBar({ label, score, weight, className }: ScoreBarProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {weight && (
            <span className="text-xs text-gray-400 dark:text-gray-500">({weight})</span>
          )}
        </div>
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            score >= 75
              ? 'text-emerald-600 dark:text-emerald-400'
              : score >= 50
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {score}
        </span>
      </div>
      <ProgressBar value={score} height="sm" />
    </div>
  );
}
