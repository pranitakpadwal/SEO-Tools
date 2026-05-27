import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { scoreTechnicalSEO } from '@/lib/scoring/scoreCalculator';
import type { AuditData } from '@/types/audit';
import { CheckCircle2, XCircle, AlertCircle, FileText, Map, Link2, Shield } from 'lucide-react';

interface TechnicalSEOSectionProps {
  data: AuditData;
}

function StatusIcon({ ok, warn }: { ok: boolean; warn?: boolean }) {
  if (ok) return <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />;
  if (warn) return <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />;
  return <XCircle size={16} className="text-red-500 flex-shrink-0" />;
}

function CheckItem({ label, ok, warn, detail }: { label: string; ok: boolean; warn?: boolean; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <StatusIcon ok={ok} warn={warn} />
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
        {detail && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </div>
  );
}

export function TechnicalSEOSection({ data }: TechnicalSEOSectionProps) {
  const { technicalSEO, security } = data;
  const score = scoreTechnicalSEO(technicalSEO, security);

  const allIssues = [
    ...technicalSEO.robotsTxt.issues,
    ...technicalSEO.sitemap.issues,
    ...technicalSEO.canonical.issues,
    ...security.issues,
  ];

  return (
    <Card>
      <CardHeader
        title="Technical SEO"
        subtitle={`${allIssues.length} issue${allIssues.length !== 1 ? 's' : ''} found`}
        icon={<span className="text-lg">⚙️</span>}
        badge={
          <Badge
            variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error'}
          >
            Score: {score}
          </Badge>
        }
      />

      <ProgressBar value={score} className="mb-6" />

      {/* Robots.txt */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Crawl & Indexation
          </h4>
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 divide-y divide-gray-100 dark:divide-gray-700/50">
          <CheckItem
            label="robots.txt"
            ok={technicalSEO.robotsTxt.exists && technicalSEO.robotsTxt.isValid}
            warn={technicalSEO.robotsTxt.exists && !technicalSEO.robotsTxt.isValid}
            detail={
              technicalSEO.robotsTxt.exists
                ? technicalSEO.robotsTxt.isValid
                  ? 'robots.txt found and valid'
                  : technicalSEO.robotsTxt.issues[0]
                : 'robots.txt not found'
            }
          />
          <CheckItem
            label="XML Sitemap"
            ok={technicalSEO.sitemap.exists && technicalSEO.sitemap.isValid}
            warn={technicalSEO.sitemap.exists && !technicalSEO.sitemap.isValid}
            detail={
              technicalSEO.sitemap.exists
                ? `Found at ${technicalSEO.sitemap.url}${technicalSEO.sitemap.urlCount ? ` (${technicalSEO.sitemap.urlCount} URLs)` : ''}`
                : technicalSEO.sitemap.issues[0]
            }
          />
          <CheckItem
            label="Canonical Tag"
            ok={technicalSEO.canonical.hasCanonical && !technicalSEO.canonical.hasMismatch}
            warn={technicalSEO.canonical.hasCanonical && technicalSEO.canonical.hasMismatch}
            detail={
              technicalSEO.canonical.hasCanonical
                ? technicalSEO.canonical.hasMismatch
                  ? `Mismatch: ${technicalSEO.canonical.canonicalUrl}`
                  : `Correct: ${technicalSEO.canonical.canonicalUrl}`
                : 'No canonical tag found'
            }
          />
        </div>
      </div>

      {/* Security */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Security
          </h4>
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 divide-y divide-gray-100 dark:divide-gray-700/50">
          <CheckItem
            label="HTTPS (SSL/TLS)"
            ok={security.isHttps}
            detail={security.isHttps ? 'Site uses HTTPS' : 'Site is not using HTTPS — critical security issue'}
          />
          <CheckItem
            label="Mixed Content"
            ok={!security.hasMixedContent}
            warn={security.hasMixedContent}
            detail={
              security.hasMixedContent
                ? `${security.mixedContentUrls.length} HTTP resource(s) on HTTPS page`
                : 'No mixed content detected'
            }
          />
        </div>

        {/* Mixed content URLs */}
        {security.mixedContentUrls.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">
              Mixed content resources:
            </p>
            <div className="space-y-1">
              {security.mixedContentUrls.slice(0, 5).map((url, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-500 font-mono truncate">
                  {url}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disallowed paths */}
      {technicalSEO.robotsTxt.disallowedPaths.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Disallowed paths in robots.txt:
          </p>
          <div className="flex flex-wrap gap-1">
            {technicalSEO.robotsTxt.disallowedPaths.slice(0, 8).map((path, i) => (
              <code key={i} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                {path}
              </code>
            ))}
            {technicalSEO.robotsTxt.disallowedPaths.length > 8 && (
              <span className="text-xs text-gray-400">+{technicalSEO.robotsTxt.disallowedPaths.length - 8} more</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
