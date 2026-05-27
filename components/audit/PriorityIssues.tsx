'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { SeverityBadge, Badge } from '@/components/ui/Badge';
import type { AuditData, Issue, Severity } from '@/types/audit';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PriorityIssuesProps {
  data: AuditData;
}

function IssueCard({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);

  const borderColors: Record<Severity, string> = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
  };

  const bgColors: Record<Severity, string> = {
    high: 'bg-red-50/50 dark:bg-red-900/5',
    medium: 'bg-amber-50/50 dark:bg-amber-900/5',
    low: 'bg-blue-50/50 dark:bg-blue-900/5',
  };

  return (
    <div
      className={cn(
        'border-l-4 rounded-r-xl transition-all duration-200',
        borderColors[issue.severity],
        bgColors[issue.severity]
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SeverityBadge severity={issue.severity} />
            <Badge variant="neutral" size="sm">{issue.category}</Badge>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
            {issue.title}
          </p>
        </div>
        <div className="flex-shrink-0 mt-0.5">
          {expanded
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Issue
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {issue.description}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
              ✓ Fix
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {issue.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function PriorityIssues({ data }: PriorityIssuesProps) {
  const { issues } = data;
  const [filter, setFilter] = useState<Severity | 'all'>('all');

  const filtered = filter === 'all' ? issues : issues.filter((i) => i.severity === filter);

  const highCount = issues.filter((i) => i.severity === 'high').length;
  const medCount = issues.filter((i) => i.severity === 'medium').length;
  const lowCount = issues.filter((i) => i.severity === 'low').length;

  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Priority Issues"
          icon={<AlertTriangle size={18} className="text-amber-500" />}
        />
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            No issues found!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your site looks great. Keep monitoring it regularly.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Priority Issues"
        subtitle={`${issues.length} issues require attention`}
        icon={<AlertTriangle size={18} className="text-amber-500" />}
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {[
          { key: 'all' as const, label: 'All', count: issues.length },
          { key: 'high' as const, label: 'High', count: highCount },
          { key: 'medium' as const, label: 'Medium', count: medCount },
          { key: 'low' as const, label: 'Low', count: lowCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              filter === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {tab.label} {tab.count > 0 && <span className="ml-1 opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Issues list */}
      <div className="space-y-2">
        {filtered.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          No {filter} priority issues found
        </div>
      )}
    </Card>
  );
}
