/**
 * Performance Analyzer
 * Uses Google PageSpeed Insights API to retrieve Core Web Vitals and performance metrics.
 * Falls back to estimated/mock data if API key is not configured.
 */

import * as cheerio from 'cheerio';
import type { PerformanceResult, MetricResult, MetricStatus, ImageIssue } from '../../types/audit';

const PAGESPEED_TIMEOUT = parseInt(process.env.PAGESPEED_TIMEOUT || '30000', 10);

// ─── Metric Thresholds (Google's Core Web Vitals) ────────────────────────────

const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000, unit: 'ms' },
  cls: { good: 0.1, poor: 0.25, unit: '' },
  inp: { good: 200, poor: 500, unit: 'ms' },
  ttfb: { good: 800, poor: 1800, unit: 'ms' },
  fcp: { good: 1800, poor: 3000, unit: 'ms' },
  tbt: { good: 200, poor: 600, unit: 'ms' },
};

function getStatus(value: number, thresholds: { good: number; poor: number }): MetricStatus {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

function buildMetric(
  value: number,
  key: keyof typeof THRESHOLDS,
  description: string
): MetricResult {
  const t = THRESHOLDS[key];
  const status = getStatus(value, t);
  const displayValue = t.unit === 'ms' ? formatMs(value) : value.toFixed(3);

  return {
    value,
    unit: t.unit,
    status,
    displayValue,
    description,
    threshold: { good: t.good, poor: t.poor },
  };
}

// ─── PageSpeed API Integration ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePageSpeedData(data: any): Omit<PerformanceResult, 'imageIssues' | 'isEstimated'> {
  const audits = data?.lighthouseResult?.audits || {};
  const fieldData = data?.loadingExperience?.metrics || {};
  const perfScore = Math.round((data?.lighthouseResult?.categories?.performance?.score || 0) * 100);

  // Prefer field data (real user metrics) over lab data when available
  const lcpField = fieldData?.LARGEST_CONTENTFUL_PAINT_MS?.percentile;
  const clsField = fieldData?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile;
  const inpField = fieldData?.INTERACTION_TO_NEXT_PAINT?.percentile;
  const ttfbField = fieldData?.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile;

  const lcpLab = audits['largest-contentful-paint']?.numericValue || 0;
  const clsLab = audits['cumulative-layout-shift']?.numericValue || 0;
  const fcpLab = audits['first-contentful-paint']?.numericValue || 0;
  const tbtLab = audits['total-blocking-time']?.numericValue || 0;
  const ttfbLab = audits['server-response-time']?.numericValue || 0;

  // Render blocking resources
  const renderBlocking: string[] = [];
  const rbItems = audits['render-blocking-resources']?.details?.items || [];
  for (const item of rbItems) {
    if (item.url) renderBlocking.push(item.url);
  }

  // Lazy loading issues
  const lazyItems = audits['uses-lazy-load-on-offscreen-images']?.details?.items || [];
  const lazyLoadingIssues: string[] = lazyItems
    .slice(0, 5)
    .map((i: Record<string, unknown>) => (i.url as string) || 'Unknown image');

  // JS bundle size (approximate from unused JS)
  const unusedJs = audits['unused-javascript']?.details?.overallSavingsBytes || 0;
  const totalBytesAudit = audits['total-byte-weight']?.numericValue || 0;

  return {
    lcp: buildMetric(lcpField || lcpLab, 'lcp', 'Largest Contentful Paint — time for the largest visible element to load'),
    cls: buildMetric(clsField !== undefined ? clsField / 100 : clsLab, 'cls', 'Cumulative Layout Shift — visual stability of the page'),
    inp: buildMetric(inpField || 0, 'inp', 'Interaction to Next Paint — responsiveness to user interactions'),
    ttfb: buildMetric(ttfbField || ttfbLab, 'ttfb', 'Time to First Byte — server response time'),
    fcp: buildMetric(fcpLab, 'fcp', 'First Contentful Paint — time for first content to appear'),
    tbt: buildMetric(tbtLab, 'tbt', 'Total Blocking Time — total time main thread was blocked'),
    performanceScore: perfScore,
    renderBlockingScripts: renderBlocking.slice(0, 10),
    lazyLoadingIssues,
    jsBundleSize: unusedJs > 0 ? unusedJs : undefined,
    totalPageSize: totalBytesAudit > 0 ? totalBytesAudit : undefined,
  };
}

// ─── Image Analysis from HTML ─────────────────────────────────────────────────

export function analyzeImages(html: string): ImageIssue[] {
  const $ = cheerio.load(html);
  const issues: ImageIssue[] = [];

  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt');
    const loading = $(el).attr('loading');
    const width = $(el).attr('width');
    const height = $(el).attr('height');

    if (alt === undefined || alt === null) {
      issues.push({ src, issue: 'Missing alt attribute', alt: undefined });
    }

    if (!width || !height) {
      issues.push({
        src,
        issue: 'Missing width/height attributes — may cause layout shift (CLS)',
        alt,
      });
    }

    if (loading !== 'lazy' && !src.startsWith('data:')) {
      // Only flag if there are many such images
      if (issues.filter(i => i.issue.includes('lazy')).length < 5) {
        issues.push({
          src,
          issue: 'Image not using lazy loading',
          alt,
        });
      }
    }
  });

  return issues.slice(0, 15);
}

// ─── Fallback Estimated Performance ──────────────────────────────────────────

function getEstimatedPerformance(): Omit<PerformanceResult, 'imageIssues' | 'isEstimated'> {
  return {
    lcp: buildMetric(2800, 'lcp', 'Largest Contentful Paint — time for the largest visible element to load'),
    cls: buildMetric(0.12, 'cls', 'Cumulative Layout Shift — visual stability of the page'),
    inp: buildMetric(250, 'inp', 'Interaction to Next Paint — responsiveness to user interactions'),
    ttfb: buildMetric(600, 'ttfb', 'Time to First Byte — server response time'),
    fcp: buildMetric(1900, 'fcp', 'First Contentful Paint — time for first content to appear'),
    tbt: buildMetric(300, 'tbt', 'Total Blocking Time — total time main thread was blocked'),
    performanceScore: 65,
    renderBlockingScripts: [],
    lazyLoadingIssues: [],
    jsBundleSize: undefined,
    totalPageSize: undefined,
  };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function analyzePerformance(
  url: string,
  html: string
): Promise<PerformanceResult> {
  const imageIssues = analyzeImages(html);
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  if (!apiKey) {
    return {
      ...getEstimatedPerformance(),
      imageIssues,
      isEstimated: true,
    };
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&key=${apiKey}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PAGESPEED_TIMEOUT);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('PageSpeed API error:', response.status);
      return { ...getEstimatedPerformance(), imageIssues, isEstimated: true };
    }

    const data = await response.json();
    return { ...parsePageSpeedData(data), imageIssues, isEstimated: false };
  } catch (err) {
    console.warn('PageSpeed API failed:', err);
    return { ...getEstimatedPerformance(), imageIssues, isEstimated: true };
  }
}
