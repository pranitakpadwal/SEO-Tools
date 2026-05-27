/**
 * Core TypeScript types for the SEO Audit Tool
 */

export type Severity = 'high' | 'medium' | 'low';
export type MetricStatus = 'good' | 'needs-improvement' | 'poor';

// ─── Request / Response ───────────────────────────────────────────────────────

export interface AuditRequest {
  url: string;
}

export interface ScoreBreakdown {
  overall: number;
  technicalSEO: number;
  performance: number;
  onPageSEO: number;
  structuredData: number;
  mobileSEO: number;
}

// ─── Technical SEO ────────────────────────────────────────────────────────────

export interface RobotsTxtResult {
  exists: boolean;
  isValid: boolean;
  content?: string;
  disallowedPaths: string[];
  issues: string[];
}

export interface SitemapResult {
  exists: boolean;
  url?: string;
  isValid: boolean;
  urlCount?: number;
  issues: string[];
}

export interface CanonicalResult {
  hasCanonical: boolean;
  canonicalUrl?: string;
  hasMismatch: boolean;
  pageUrl: string;
  issues: string[];
}

export interface TechnicalSEOResult {
  robotsTxt: RobotsTxtResult;
  sitemap: SitemapResult;
  canonical: CanonicalResult;
}

// ─── Performance ──────────────────────────────────────────────────────────────

export interface MetricResult {
  value: number;
  unit: string;
  status: MetricStatus;
  displayValue: string;
  description: string;
  threshold: { good: number; poor: number };
}

export interface ImageIssue {
  src: string;
  issue: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface PerformanceResult {
  lcp: MetricResult;
  cls: MetricResult;
  inp: MetricResult;
  ttfb: MetricResult;
  fcp: MetricResult;
  tbt: MetricResult;
  performanceScore: number;
  renderBlockingScripts: string[];
  imageIssues: ImageIssue[];
  lazyLoadingIssues: string[];
  jsBundleSize?: number;
  totalPageSize?: number;
  isEstimated: boolean;
}

// ─── On-Page SEO ─────────────────────────────────────────────────────────────

export interface TitleResult {
  content: string;
  length: number;
  isOptimalLength: boolean;
  issues: string[];
}

export interface MetaDescriptionResult {
  content: string;
  length: number;
  isOptimalLength: boolean;
  issues: string[];
}

export interface HeadingResult {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  hasMultipleH1: boolean;
  isMissingH1: boolean;
  hierarchyIssues: string[];
  totalHeadings: number;
}

export interface OnPageSEOResult {
  title: TitleResult;
  metaDescription: MetaDescriptionResult;
  headings: HeadingResult;
}

// ─── Mobile SEO ──────────────────────────────────────────────────────────────

export interface MobileSEOResult {
  hasViewportTag: boolean;
  viewportContent?: string;
  isViewportOptimal: boolean;
  issues: string[];
}

// ─── Security ────────────────────────────────────────────────────────────────

export interface SecurityResult {
  isHttps: boolean;
  hasMixedContent: boolean;
  mixedContentUrls: string[];
  issues: string[];
}

// ─── Structured Data ─────────────────────────────────────────────────────────

export interface SchemaItem {
  type: string;
  raw: string;
  properties?: Record<string, unknown>;
}

export interface StructuredDataResult {
  hasSchema: boolean;
  schemas: SchemaItem[];
  schemaTypes: string[];
  issues: string[];
}

// ─── Issues & Recommendations ─────────────────────────────────────────────────

export interface Issue {
  id: string;
  severity: Severity;
  category: 'Technical SEO' | 'Performance' | 'On-Page SEO' | 'Mobile SEO' | 'Security' | 'Structured Data';
  title: string;
  description: string;
  recommendation: string;
}

export interface Recommendation {
  id: string;
  priority: Severity;
  category: string;
  title: string;
  description: string;
  impact: string;
  effortLevel: 'low' | 'medium' | 'high';
}

// ─── Full Audit Result ────────────────────────────────────────────────────────

export interface AuditData {
  id: string;
  url: string;
  domain: string;
  timestamp: string;
  scores: ScoreBreakdown;
  technicalSEO: TechnicalSEOResult;
  performance: PerformanceResult;
  onPageSEO: OnPageSEOResult;
  mobileSEO: MobileSEOResult;
  security: SecurityResult;
  structuredData: StructuredDataResult;
  issues: Issue[];
  recommendations: Recommendation[];
  fetchError?: string;
  pageTitle?: string;
}

// ─── Audit Progress Steps ─────────────────────────────────────────────────────

export interface AuditStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
}
