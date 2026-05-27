import { Card, CardHeader } from '@/components/ui/Card';
import { SeverityBadge, Badge } from '@/components/ui/Badge';
import type { AuditData, Recommendation } from '@/types/audit';
import { Sparkles, ArrowRight, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AIRecommendationsSectionProps {
  data: AuditData;
}

const effortColors = {
  low: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
};

const effortLabels = {
  low: 'Quick win',
  medium: 'Moderate effort',
  high: 'High effort',
};

const categoryIcons: Record<string, string> = {
  Performance: '⚡',
  'On-Page SEO': '📝',
  'Technical SEO': '⚙️',
  'Structured Data': '🧩',
  'Mobile SEO': '📱',
  Security: '🔒',
  'Advanced SEO': '🚀',
};

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-card transition-all duration-200">
      {/* Priority indicator */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{categoryIcons[rec.category] || '💡'}</span>
          <SeverityBadge severity={rec.priority} />
          <Badge variant="neutral" size="sm">{rec.category}</Badge>
        </div>
        <span className={cn('text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0', effortColors[rec.effortLevel])}>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {effortLabels[rec.effortLevel]}
          </span>
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
        {rec.title}
      </h4>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
        {rec.description}
      </p>

      {/* Impact */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
        <Zap size={12} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          {rec.impact}
        </p>
      </div>
    </div>
  );
}

export function AIRecommendationsSection({ data }: AIRecommendationsSectionProps) {
  const { recommendations } = data;

  const highPriority = recommendations.filter((r) => r.priority === 'high');
  const otherRecs = recommendations.filter((r) => r.priority !== 'high');

  return (
    <Card>
      <CardHeader
        title="AI Recommendations"
        subtitle={`${recommendations.length} actionable improvements identified`}
        icon={<Sparkles size={18} className="text-brand-500" />}
      />

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Outstanding SEO!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No major improvements needed. Keep up the great work!
          </p>
        </div>
      ) : (
        <>
          {/* High priority section */}
          {highPriority.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  High Priority — Fix First
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highPriority.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Other recommendations */}
          {otherRecs.length > 0 && (
            <div>
              {highPriority.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Medium &amp; Low Priority
                  </h4>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherRecs.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-brand-700 dark:text-brand-400 leading-relaxed">
                <strong>Smart recommendations</strong> are generated by analyzing your site&apos;s audit data.
                Prioritize high-impact, low-effort items first for the best ROI on your SEO investment.
                Re-run the audit after implementing changes to track progress.
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
