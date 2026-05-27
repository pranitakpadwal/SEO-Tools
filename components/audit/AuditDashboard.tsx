'use client';

import { useRouter } from 'next/navigation';
import type { AuditData } from '@/types/audit';
import { OverallScore } from './OverallScore';
import { TechnicalSEOSection } from './TechnicalSEOSection';
import { CoreWebVitalsSection } from './CoreWebVitalsSection';
import { OnPageSEOSection } from './OnPageSEOSection';
import { MobileAndSecuritySection } from './MobileAndSecuritySection';
import { StructuredDataSection } from './StructuredDataSection';
import { PriorityIssues } from './PriorityIssues';
import { AIRecommendationsSection } from './AIRecommendationsSection';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Download, AlertTriangle } from 'lucide-react';

interface AuditDashboardProps {
  data: AuditData;
}

export function AuditDashboard({ data }: AuditDashboardProps) {
  const router = useRouter();

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: '📊', score: data.scores.overall },
    { id: 'technical', label: 'Technical SEO', icon: '⚙️', score: data.scores.technicalSEO },
    { id: 'performance', label: 'Performance', icon: '⚡', score: data.scores.performance },
    { id: 'onpage', label: 'On-Page SEO', icon: '📝', score: data.scores.onPageSEO },
    { id: 'mobile', label: 'Mobile SEO', icon: '📱', score: data.scores.mobileSEO },
    { id: 'schema', label: 'Structured Data', icon: '🧩', score: data.scores.structuredData },
    { id: 'issues', label: 'Priority Issues', icon: '🔴' },
    { id: 'recommendations', label: 'AI Recommendations', icon: '✨' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {data.pageTitle || data.domain}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            SEO Health Report
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={() => router.push(`/?url=${encodeURIComponent(data.url)}`)}
          >
            Re-run Audit
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={() => {
              const json = JSON.stringify(data, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `seo-audit-${data.domain}-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Fetch error notice */}
      {data.fetchError && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Warning: Could not fully fetch the page
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{data.fetchError}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              robots.txt and sitemap checks still ran. On-page analysis may be incomplete.
            </p>
          </div>
        </div>
      )}

      {/* Main layout: sidebar + content */}
      <div className="flex gap-6">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <Sidebar sections={sidebarSections} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          <section id="overview">
            <OverallScore data={data} />
          </section>

          <section id="technical">
            <TechnicalSEOSection data={data} />
          </section>

          <section id="performance">
            <CoreWebVitalsSection data={data} />
          </section>

          <section id="onpage">
            <OnPageSEOSection data={data} />
          </section>

          <section id="mobile">
            <MobileAndSecuritySection data={data} />
          </section>

          <section id="schema">
            <StructuredDataSection data={data} />
          </section>

          <section id="issues">
            <PriorityIssues data={data} />
          </section>

          <section id="recommendations">
            <AIRecommendationsSection data={data} />
          </section>
        </div>
      </div>
    </div>
  );
}
