import { Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/charts/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { AuditData } from '@/types/audit';
import { AlertTriangle, Zap } from 'lucide-react';

interface CoreWebVitalsSectionProps {
  data: AuditData;
}

export function CoreWebVitalsSection({ data }: CoreWebVitalsSectionProps) {
  const { performance } = data;
  const score = performance.performanceScore;

  return (
    <Card>
      <CardHeader
        title="Core Web Vitals & Performance"
        subtitle="Google PageSpeed Insights analysis"
        icon={<Zap size={18} className="text-amber-500" />}
        badge={
          <Badge variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error'}>
            Score: {score}
          </Badge>
        }
      />

      <ProgressBar value={score} className="mb-6" />

      {/* Estimated data notice */}
      {performance.isEstimated && (
        <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 text-sm">
          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-amber-700 dark:text-amber-400">Demo mode: </span>
            <span className="text-amber-600 dark:text-amber-500">
              No GOOGLE_PAGESPEED_API_KEY configured. Displaying estimated performance data.
              Add your API key to get real Core Web Vitals.
            </span>
          </div>
        </div>
      )}

      {/* Core Web Vitals */}
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Core Web Vitals
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        <MetricCard metric={performance.lcp} label="LCP" icon="🖼️" />
        <MetricCard metric={performance.cls} label="CLS" icon="📐" />
        <MetricCard metric={performance.inp} label="INP" icon="👆" />
      </div>

      {/* Additional Metrics */}
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Additional Metrics
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        <MetricCard metric={performance.ttfb} label="TTFB" icon="🌐" />
        <MetricCard metric={performance.fcp} label="FCP" icon="🎨" />
        <MetricCard metric={performance.tbt} label="TBT" icon="⏱️" />
      </div>

      <CardDivider />

      {/* Render blocking */}
      {performance.renderBlockingScripts.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Render-Blocking Resources ({performance.renderBlockingScripts.length})
          </h4>
          <div className="space-y-1.5">
            {performance.renderBlockingScripts.slice(0, 5).map((script, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <code className="text-xs text-red-700 dark:text-red-400 truncate font-mono">
                  {script}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image issues */}
      {performance.imageIssues.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Image Issues ({performance.imageIssues.length})
          </h4>
          <div className="space-y-1.5">
            {performance.imageIssues.slice(0, 5).map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
                <div className="min-w-0">
                  <p className="text-xs text-amber-700 dark:text-amber-400">{issue.issue}</p>
                  {issue.src && (
                    <code className="text-xs text-amber-600 dark:text-amber-500 truncate block font-mono">
                      {issue.src.slice(0, 60)}{issue.src.length > 60 ? '...' : ''}
                    </code>
                  )}
                </div>
              </div>
            ))}
            {performance.imageIssues.length > 5 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">
                +{performance.imageIssues.length - 5} more image issues
              </p>
            )}
          </div>
        </div>
      )}

      {/* Page size */}
      {performance.totalPageSize && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm">
          <span>📦</span>
          <span className="text-gray-700 dark:text-gray-300">
            Total page size:{' '}
            <strong>{(performance.totalPageSize / 1024).toFixed(1)} KB</strong>
            {performance.jsBundleSize && (
              <span className="text-gray-500 ml-2">
                (JS savings available: {(performance.jsBundleSize / 1024).toFixed(1)} KB)
              </span>
            )}
          </span>
        </div>
      )}
    </Card>
  );
}
