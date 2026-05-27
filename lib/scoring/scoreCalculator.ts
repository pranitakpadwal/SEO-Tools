/**
 * SEO Score Calculator
 * Computes weighted scores for each audit category and the overall health score.
 *
 * Weights:
 *   Technical SEO   = 35%
 *   Performance     = 30%
 *   On-page SEO     = 20%
 *   Structured Data = 10%
 *   Mobile SEO      =  5%
 */

import type {
  TechnicalSEOResult,
  PerformanceResult,
  OnPageSEOResult,
  MobileSEOResult,
  SecurityResult,
  StructuredDataResult,
  ScoreBreakdown,
} from '../../types/audit';

// ─── Individual Category Scorers ─────────────────────────────────────────────

export function scoreTechnicalSEO(
  tech: TechnicalSEOResult,
  security: SecurityResult
): number {
  let score = 100;

  // robots.txt (20 pts)
  if (!tech.robotsTxt.exists) score -= 15;
  else if (!tech.robotsTxt.isValid) score -= 8;

  // sitemap (20 pts)
  if (!tech.sitemap.exists) score -= 18;
  else if (!tech.sitemap.isValid) score -= 8;

  // canonical (20 pts)
  if (!tech.canonical.hasCanonical) score -= 12;
  else if (tech.canonical.hasMismatch) score -= 15;
  else if (tech.canonical.issues.length > 1) score -= 5;

  // security (25 pts)
  if (!security.isHttps) score -= 25;
  else if (security.hasMixedContent) score -= 12;

  // Extra deductions for critical issues
  const criticalIssues =
    tech.robotsTxt.issues.filter((i) =>
      i.includes('blocking all crawlers')
    ).length;
  if (criticalIssues > 0) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scorePerformance(perf: PerformanceResult): number {
  // If we got a real PageSpeed score, use it directly
  if (!perf.isEstimated) {
    return Math.max(0, Math.min(100, perf.performanceScore));
  }

  // Otherwise, compute from individual metrics
  let score = 100;

  const metricPenalties = {
    lcp: { 'good': 0, 'needs-improvement': 15, 'poor': 30 },
    cls: { 'good': 0, 'needs-improvement': 10, 'poor': 20 },
    inp: { 'good': 0, 'needs-improvement': 10, 'poor': 20 },
    ttfb: { 'good': 0, 'needs-improvement': 8, 'poor': 15 },
    fcp: { 'good': 0, 'needs-improvement': 8, 'poor': 15 },
    tbt: { 'good': 0, 'needs-improvement': 5, 'poor': 12 },
  };

  for (const [metric, penalties] of Object.entries(metricPenalties)) {
    const status = perf[metric as keyof typeof metricPenalties].status;
    score -= penalties[status];
  }

  if (perf.renderBlockingScripts.length > 3) score -= 10;
  if (perf.imageIssues.length > 5) score -= 8;
  if (perf.lazyLoadingIssues.length > 3) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreOnPageSEO(onPage: OnPageSEOResult): number {
  let score = 100;

  // Title (35 pts)
  if (!onPage.title.content) score -= 35;
  else if (!onPage.title.isOptimalLength) score -= 15;
  else if (onPage.title.issues.length > 0) score -= 8;

  // Meta description (35 pts)
  if (!onPage.metaDescription.content) score -= 30;
  else if (!onPage.metaDescription.isOptimalLength) score -= 12;
  else if (onPage.metaDescription.issues.length > 0) score -= 6;

  // H1 (20 pts)
  if (onPage.headings.isMissingH1) score -= 20;
  else if (onPage.headings.hasMultipleH1) score -= 12;

  // Heading hierarchy (10 pts)
  const hierarchyIssueCount = onPage.headings.hierarchyIssues.filter(
    (i) => !i.includes('Multiple H1') && !i.includes('Missing H1')
  ).length;
  score -= Math.min(10, hierarchyIssueCount * 4);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreStructuredData(schema: StructuredDataResult): number {
  if (!schema.hasSchema) return 20; // Baseline penalty for no schema

  let score = 70; // Base score for having schema

  // Bonus for multiple schema types
  score += Math.min(20, schema.schemaTypes.length * 8);

  // Bonus for having no issues
  if (schema.issues.length === 0) score += 10;
  else score -= Math.min(15, schema.issues.length * 5);

  // Bonus for important schema types
  const valuableTypes = ['Organization', 'WebSite', 'BreadcrumbList', 'Product',
    'Article', 'LocalBusiness', 'FAQPage', 'HowTo', 'Review'];
  const hasValuable = schema.schemaTypes.some((t) => valuableTypes.includes(t));
  if (hasValuable) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreMobileSEO(mobile: MobileSEOResult): number {
  let score = 100;

  if (!mobile.hasViewportTag) score -= 60;
  else if (!mobile.isViewportOptimal) score -= 30;

  score -= Math.min(40, mobile.issues.length * 12);

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Overall Score ────────────────────────────────────────────────────────────

export function calculateScores(data: {
  technicalSEO: TechnicalSEOResult;
  performance: PerformanceResult;
  onPageSEO: OnPageSEOResult;
  mobileSEO: MobileSEOResult;
  security: SecurityResult;
  structuredData: StructuredDataResult;
}): ScoreBreakdown {
  const technicalSEO = scoreTechnicalSEO(data.technicalSEO, data.security);
  const performance = scorePerformance(data.performance);
  const onPageSEO = scoreOnPageSEO(data.onPageSEO);
  const structuredData = scoreStructuredData(data.structuredData);
  const mobileSEO = scoreMobileSEO(data.mobileSEO);

  // Weighted overall score
  const overall = Math.round(
    technicalSEO * 0.35 +
    performance * 0.30 +
    onPageSEO * 0.20 +
    structuredData * 0.10 +
    mobileSEO * 0.05
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    technicalSEO,
    performance,
    onPageSEO,
    structuredData,
    mobileSEO,
  };
}

// ─── Score Label Helpers ──────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Work';
  if (score >= 25) return 'Poor';
  return 'Critical';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getScoreRingColor(score: number): string {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}
