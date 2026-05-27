/**
 * Crawl & Indexation Analyzer
 * Checks robots.txt, XML sitemap, and canonical tags.
 */

import * as cheerio from 'cheerio';
import { fetchText } from '../utils/htmlFetcher';
import type { RobotsTxtResult, SitemapResult, CanonicalResult } from '../../types/audit';

// ─── Robots.txt Analysis ─────────────────────────────────────────────────────

export async function analyzeRobotsTxt(baseUrl: string): Promise<RobotsTxtResult> {
  const robotsUrl = `${baseUrl}/robots.txt`;

  const result = await fetchText(robotsUrl);

  if (!result) {
    return {
      exists: false,
      isValid: false,
      disallowedPaths: [],
      issues: ['robots.txt not found or inaccessible'],
    };
  }

  const { text: content } = result;
  const lines = content.split('\n').map((l) => l.trim());
  const issues: string[] = [];
  const disallowedPaths: string[] = [];

  let hasUserAgent = false;
  let hasSitemapDirective = false;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    if (line.toLowerCase().startsWith('user-agent:')) {
      hasUserAgent = true;
    }
    if (line.toLowerCase().startsWith('disallow:')) {
      const path = line.split(':')[1]?.trim();
      if (path) disallowedPaths.push(path);

      // Check if entire site is blocked
      if (path === '/') {
        issues.push('robots.txt is blocking all crawlers with "Disallow: /"');
      }
    }
    if (line.toLowerCase().startsWith('sitemap:')) {
      hasSitemapDirective = true;
    }
  }

  if (!hasUserAgent) {
    issues.push('robots.txt is missing User-agent directive');
  }
  if (!hasSitemapDirective) {
    issues.push('robots.txt does not reference a sitemap');
  }

  return {
    exists: true,
    isValid: issues.length === 0,
    content: content.slice(0, 2000), // Limit stored content
    disallowedPaths: disallowedPaths.slice(0, 20),
    issues,
  };
}

// ─── Sitemap Analysis ─────────────────────────────────────────────────────────

export async function analyzeSitemap(baseUrl: string): Promise<SitemapResult> {
  const commonSitemapPaths = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-index.xml',
    '/sitemaps/sitemap.xml',
  ];

  for (const path of commonSitemapPaths) {
    const sitemapUrl = `${baseUrl}${path}`;
    const result = await fetchText(sitemapUrl, 8000);

    if (result && result.statusCode === 200 && result.text.includes('<url>') ||
        result && result.statusCode === 200 && result.text.includes('<sitemap>')) {
      // Parse URL count
      const urlMatches = result.text.match(/<url>/g);
      const urlCount = urlMatches ? urlMatches.length : undefined;

      const issues: string[] = [];
      if (urlCount === 0) {
        issues.push('Sitemap is empty (no URLs found)');
      }

      return {
        exists: true,
        url: sitemapUrl,
        isValid: true,
        urlCount,
        issues,
      };
    }
  }

  return {
    exists: false,
    isValid: false,
    issues: ['No XML sitemap found. Checked: ' + commonSitemapPaths.join(', ')],
  };
}

// ─── Canonical Tag Analysis ────────────────────────────────────────────────────

export function analyzeCanonical(html: string, pageUrl: string): CanonicalResult {
  const $ = cheerio.load(html);
  const canonicalEl = $('link[rel="canonical"]');
  const issues: string[] = [];

  if (canonicalEl.length === 0) {
    return {
      hasCanonical: false,
      hasMismatch: false,
      pageUrl,
      issues: ['No canonical tag found'],
    };
  }

  const canonicalUrl = canonicalEl.first().attr('href')?.trim();

  if (!canonicalUrl) {
    return {
      hasCanonical: true,
      hasMismatch: false,
      pageUrl,
      issues: ['Canonical tag is empty'],
    };
  }

  // Check for multiple canonical tags
  if (canonicalEl.length > 1) {
    issues.push('Multiple canonical tags detected');
  }

  // Normalize URLs for comparison (remove trailing slash, lowercase)
  const normalizeForCompare = (url: string) =>
    url.toLowerCase().replace(/\/$/, '').replace(/^http:\/\//, 'https://');

  const hasMismatch =
    normalizeForCompare(canonicalUrl) !== normalizeForCompare(pageUrl);

  if (hasMismatch) {
    issues.push(
      `Canonical URL (${canonicalUrl}) differs from page URL (${pageUrl})`
    );
  }

  return {
    hasCanonical: true,
    canonicalUrl,
    hasMismatch,
    pageUrl,
    issues,
  };
}
