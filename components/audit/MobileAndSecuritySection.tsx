import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { scoreMobileSEO } from '@/lib/scoring/scoreCalculator';
import type { AuditData } from '@/types/audit';
import { Smartphone, CheckCircle2, XCircle } from 'lucide-react';

interface MobileAndSecuritySectionProps {
  data: AuditData;
}

export function MobileAndSecuritySection({ data }: MobileAndSecuritySectionProps) {
  const { mobileSEO } = data;
  const score = scoreMobileSEO(mobileSEO);

  return (
    <Card>
      <CardHeader
        title="Mobile SEO"
        subtitle="Mobile-friendliness and responsiveness"
        icon={<Smartphone size={18} className="text-blue-500" />}
        badge={
          <Badge variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error'}>
            Score: {score}
          </Badge>
        }
      />

      <ProgressBar value={score} className="mb-6" />

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 divide-y divide-gray-100 dark:divide-gray-700/50">
        {/* Viewport tag */}
        <div className="flex items-start gap-3 py-3">
          {mobileSEO.hasViewportTag
            ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            : <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          }
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Viewport Meta Tag
            </span>
            {mobileSEO.viewportContent && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 mt-1">
                {mobileSEO.viewportContent}
              </p>
            )}
            {!mobileSEO.hasViewportTag && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Missing — required for mobile responsiveness
              </p>
            )}
          </div>
        </div>

        {/* Optimal viewport */}
        <div className="flex items-start gap-3 py-3">
          {mobileSEO.isViewportOptimal
            ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            : <XCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          }
          <div className="min-w-0">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Optimal Viewport Configuration
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {mobileSEO.isViewportOptimal
                ? 'width=device-width, initial-scale=1 configured correctly'
                : 'Viewport should include width=device-width and initial-scale=1'
              }
            </p>
          </div>
        </div>

        {/* Mobile-friendly */}
        <div className="flex items-start gap-3 py-3">
          {(mobileSEO.hasViewportTag && mobileSEO.isViewportOptimal)
            ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            : <XCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          }
          <div className="min-w-0">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Mobile-Friendly Signals
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {(mobileSEO.hasViewportTag && mobileSEO.isViewportOptimal)
                ? 'Basic mobile-friendly configuration detected'
                : 'Mobile-friendly configuration needs improvement'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Additional issues */}
      {mobileSEO.issues.length > 0 && (
        <div className="mt-4 space-y-2">
          {mobileSEO.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-2.5 rounded-lg border border-amber-100 dark:border-amber-800/30">
              <span className="mt-0.5">⚠</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mobile best practice hint */}
      <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          <strong>💡 Pro tip:</strong> Google uses mobile-first indexing, meaning the mobile version of your site is used for ranking. Test your site at{' '}
          <span className="font-mono">search.google.com/test/mobile-friendly</span> for a comprehensive check.
        </p>
      </div>
    </Card>
  );
}
