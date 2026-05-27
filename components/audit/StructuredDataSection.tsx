import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { scoreStructuredData } from '@/lib/scoring/scoreCalculator';
import type { AuditData } from '@/types/audit';
import { Code2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StructuredDataSectionProps {
  data: AuditData;
}

const SCHEMA_ICONS: Record<string, string> = {
  Organization: '🏢',
  WebSite: '🌐',
  WebPage: '📄',
  Article: '📰',
  NewsArticle: '📰',
  BlogPosting: '✍️',
  Product: '🛍️',
  LocalBusiness: '📍',
  Person: '👤',
  FAQPage: '❓',
  HowTo: '🔧',
  Recipe: '🍳',
  Event: '📅',
  Review: '⭐',
  BreadcrumbList: '🔗',
  VideoObject: '🎬',
  ImageObject: '🖼️',
  Course: '📚',
  JobPosting: '💼',
  SoftwareApplication: '💻',
};

const VALUABLE_SCHEMAS = [
  'Organization', 'WebSite', 'BreadcrumbList', 'FAQPage', 'HowTo',
  'Product', 'Review', 'Article', 'LocalBusiness', 'Course',
];

export function StructuredDataSection({ data }: StructuredDataSectionProps) {
  const { structuredData } = data;
  const score = scoreStructuredData(structuredData);

  return (
    <Card>
      <CardHeader
        title="Structured Data"
        subtitle="Schema markup and JSON-LD analysis"
        icon={<Code2 size={18} className="text-indigo-500" />}
        badge={
          <Badge variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error'}>
            Score: {score}
          </Badge>
        }
      />

      <ProgressBar value={score} className="mb-6" />

      {/* Status */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-5">
        {structuredData.hasSchema
          ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          : <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
        }
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {structuredData.hasSchema
              ? `${structuredData.schemas.length} schema type${structuredData.schemas.length !== 1 ? 's' : ''} detected`
              : 'No structured data found'
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {structuredData.hasSchema
              ? `Types: ${structuredData.schemaTypes.join(', ')}`
              : 'Adding schema markup helps with rich results in Google Search'
            }
          </p>
        </div>
      </div>

      {/* Schema items */}
      {structuredData.schemas.length > 0 && (
        <div className="space-y-2 mb-5">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Detected Schemas
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {structuredData.schemaTypes.map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30"
              >
                <span className="text-lg flex-shrink-0">
                  {SCHEMA_ICONS[type] || '📋'}
                </span>
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400 truncate">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {structuredData.issues.length > 0 && (
        <div className="space-y-2 mb-5">
          {structuredData.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-2.5 rounded-lg border border-amber-100 dark:border-amber-800/30">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommended schemas */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Recommended Schema Types
        </h4>
        <div className="flex flex-wrap gap-2">
          {VALUABLE_SCHEMAS.map((type) => {
            const isPresent = structuredData.schemaTypes.includes(type);
            return (
              <div
                key={type}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs',
                  isPresent
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                )}
              >
                <span>{isPresent ? '✓' : '○'}</span>
                <span>{type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
