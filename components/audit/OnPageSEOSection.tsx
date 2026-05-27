import { Card, CardHeader, CardDivider } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { scoreOnPageSEO } from '@/lib/scoring/scoreCalculator';
import type { AuditData } from '@/types/audit';
import { CheckCircle2, XCircle, AlertCircle, Type, AlignLeft, Heading1 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnPageSEOSectionProps {
  data: AuditData;
}

interface LengthMeterProps {
  value: number;
  min: number;
  max: number;
  label?: string;
}

function LengthMeter({ value, min, max, label }: LengthMeterProps) {
  const isOptimal = value >= min && value <= max;
  const percentage = Math.min(100, (value / (max * 1.3)) * 100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>0</span>
        <span className={cn('font-medium', isOptimal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
          {value} chars {label && `— ${label}`}
        </span>
        <span>200+</span>
      </div>
      <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-800">
        {/* Optimal zone */}
        <div
          className="absolute top-0 h-full rounded-full bg-emerald-100 dark:bg-emerald-900/30 opacity-50"
          style={{
            left: `${(min / 200) * 100}%`,
            width: `${((max - min) / 200) * 100}%`,
          }}
        />
        {/* Current value */}
        <div
          className={cn(
            'absolute top-0 h-full w-2 rounded-full transition-all duration-500',
            isOptimal ? 'bg-emerald-500' : 'bg-amber-500'
          )}
          style={{ left: `${Math.min(98, percentage)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
        <span></span>
        <span className="text-emerald-600 dark:text-emerald-400">Optimal: {min}–{max}</span>
        <span></span>
      </div>
    </div>
  );
}

function HeadingTag({ tag, texts }: { tag: string; texts: string[] }) {
  if (texts.length === 0) return null;

  const colors: Record<string, string> = {
    H1: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800/50',
    H2: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    H3: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50',
    H4: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <span className={cn('text-xs font-bold px-2 py-1 rounded-md border flex-shrink-0', colors[tag] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700')}>
        {tag}
      </span>
      <div className="flex-1 min-w-0 space-y-1">
        {texts.slice(0, 3).map((text, i) => (
          <p key={i} className="text-sm text-gray-700 dark:text-gray-300 truncate">{text}</p>
        ))}
        {texts.length > 3 && (
          <p className="text-xs text-gray-400">+{texts.length - 3} more</p>
        )}
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{texts.length}</span>
    </div>
  );
}

export function OnPageSEOSection({ data }: OnPageSEOSectionProps) {
  const { onPageSEO } = data;
  const score = scoreOnPageSEO(onPageSEO);

  return (
    <Card>
      <CardHeader
        title="On-Page SEO"
        subtitle="Metadata and content structure analysis"
        icon={<Type size={18} className="text-brand-500" />}
        badge={
          <Badge variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error'}>
            Score: {score}
          </Badge>
        }
      />

      <ProgressBar value={score} className="mb-6" />

      {/* Title Tag */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Type size={14} className="text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Title Tag
          </h4>
          {onPageSEO.title.content
            ? onPageSEO.title.isOptimalLength
              ? <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Optimal</span>
              : <span className="text-xs text-amber-600 dark:text-amber-400">⚠ Suboptimal</span>
            : <span className="text-xs text-red-600 dark:text-red-400">✗ Missing</span>
          }
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
          {onPageSEO.title.content ? (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                &quot;{onPageSEO.title.content}&quot;
              </p>
              <LengthMeter
                value={onPageSEO.title.length}
                min={30}
                max={60}
                label={onPageSEO.title.isOptimalLength ? 'optimal length' : 'adjust length'}
              />
            </>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400">No title tag found</p>
          )}

          {onPageSEO.title.issues.length > 0 && (
            <div className="mt-3 space-y-1">
              {onPageSEO.title.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                  {issue}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meta Description */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <AlignLeft size={14} className="text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Meta Description
          </h4>
          {onPageSEO.metaDescription.content
            ? onPageSEO.metaDescription.isOptimalLength
              ? <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Optimal</span>
              : <span className="text-xs text-amber-600 dark:text-amber-400">⚠ Suboptimal</span>
            : <span className="text-xs text-red-600 dark:text-red-400">✗ Missing</span>
          }
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
          {onPageSEO.metaDescription.content ? (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                &quot;{onPageSEO.metaDescription.content}&quot;
              </p>
              <LengthMeter
                value={onPageSEO.metaDescription.length}
                min={120}
                max={160}
                label={onPageSEO.metaDescription.isOptimalLength ? 'optimal length' : 'adjust length'}
              />
            </>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400">No meta description found</p>
          )}

          {onPageSEO.metaDescription.issues.length > 0 && (
            <div className="mt-3 space-y-1">
              {onPageSEO.metaDescription.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                  {issue}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CardDivider />

      {/* Headings */}
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Heading1 size={14} className="text-gray-400" />
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Heading Structure
            </h4>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {onPageSEO.headings.totalHeadings} total headings
          </span>
        </div>

        {/* Heading issues */}
        {onPageSEO.headings.hierarchyIssues.length > 0 && (
          <div className="mb-3 space-y-1">
            {onPageSEO.headings.hierarchyIssues.map((issue, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
                <XCircle size={12} className="flex-shrink-0 mt-0.5" />
                {issue}
              </div>
            ))}
          </div>
        )}

        {/* Heading list */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 divide-y divide-gray-100 dark:divide-gray-700/50">
          {onPageSEO.headings.h1.length === 0 && (
            <div className="flex items-center gap-3 py-2">
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">H1</span>
              <p className="text-sm text-red-500 dark:text-red-400 italic">Missing H1</p>
            </div>
          )}
          <HeadingTag tag="H1" texts={onPageSEO.headings.h1} />
          <HeadingTag tag="H2" texts={onPageSEO.headings.h2} />
          <HeadingTag tag="H3" texts={onPageSEO.headings.h3} />
          <HeadingTag tag="H4" texts={onPageSEO.headings.h4} />
        </div>
      </div>
    </Card>
  );
}
