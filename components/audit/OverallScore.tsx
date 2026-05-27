'use client';

import { ScoreGauge } from '@/components/charts/ScoreGauge';
import { ScoreBar } from '@/components/ui/ProgressBar';
import { DonutChart } from '@/components/charts/DonutChart';
import { Card } from '@/components/ui/Card';
import type { AuditData } from '@/types/audit';
import { getScoreRingColor } from '@/lib/scoring/scoreCalculator';
import { ExternalLink, Clock, Globe, AlertTriangle } from 'lucide-react';

interface OverallScoreProps {
  data: AuditData;
}

const SCORE_CATEGORIES = [
  { key: 'technicalSEO', label: 'Technical SEO', weight: '35%' },
  { key: 'performance', label: 'Performance', weight: '30%' },
  { key: 'onPageSEO', label: 'On-Page SEO', weight: '20%' },
  { key: 'structuredData', label: 'Structured Data', weight: '10%' },
  { key: 'mobileSEO', label: 'Mobile SEO', weight: '5%' },
] as const;

export function OverallScore({ data }: OverallScoreProps) {
  const { scores, url, domain, timestamp, issues } = data;

  const donutData = SCORE_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: scores[cat.key as keyof typeof scores],
    color: getScoreRingColor(scores[cat.key as keyof typeof scores]),
  }));

  const highIssues = issues.filter((i) => i.severity === 'high').length;
  const mediumIssues = issues.filter((i) => i.severity === 'medium').length;
  const lowIssues = issues.filter((i) => i.severity === 'low').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main Score */}
      <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8">
        <ScoreGauge
          score={scores.overall}
          size={200}
          thickness={14}
        />
        <div className="mt-6 text-center px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overall Health Score</p>
          {data.performance.isEstimated && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle size={11} />
              <span>Performance data estimated (no API key)</span>
            </div>
          )}
        </div>

        {/* Site info */}
        <div className="mt-4 w-full px-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Globe size={12} className="flex-shrink-0" />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-brand-500 flex items-center gap-1"
            >
              {domain}
              <ExternalLink size={10} />
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} className="flex-shrink-0" />
            <span>
              Audited {new Date(timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </Card>

      {/* Score Breakdown */}
      <Card className="lg:col-span-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-5">
          Score Breakdown
        </h3>
        <div className="space-y-4">
          {SCORE_CATEGORIES.map((cat) => (
            <ScoreBar
              key={cat.key}
              label={cat.label}
              score={scores[cat.key as keyof typeof scores]}
              weight={cat.weight}
            />
          ))}
        </div>
      </Card>

      {/* Issues Summary */}
      <Card className="lg:col-span-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-5">
          Issues Found
        </h3>

        <DonutChart
          data={[
            { name: 'High', value: highIssues || 0.1, color: '#ef4444' },
            { name: 'Medium', value: mediumIssues || 0.1, color: '#f59e0b' },
            { name: 'Low', value: lowIssues || 0.1, color: '#3b82f6' },
          ]}
          centerLabel="issues"
          centerValue={issues.length}
        />

        <div className="mt-1 grid grid-cols-3 gap-2">
          {[
            { label: 'High', count: highIssues, color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
            { label: 'Medium', count: mediumIssues, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
            { label: 'Low', count: lowIssues, color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className={`text-2xl font-bold ${item.text}`}>{item.count}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
