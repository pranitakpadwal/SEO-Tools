/**
 * Main SEO Audit API Route
 * POST /api/audit - Run a full SEO audit on the provided URL
 * GET  /api/audit?id=xxx - Retrieve a previously run audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { validateUrl, getBaseUrl, extractDomain } from '@/lib/utils/urlValidator';
import { fetchHtml } from '@/lib/utils/htmlFetcher';
import { analyzeRobotsTxt, analyzeSitemap, analyzeCanonical } from '@/lib/analyzers/crawlAnalyzer';
import { analyzeTitle, analyzeMetaDescription } from '@/lib/analyzers/metadataAnalyzer';
import { analyzeHeadings } from '@/lib/analyzers/headingAnalyzer';
import { analyzePerformance } from '@/lib/analyzers/performanceAnalyzer';
import { analyzeMobile } from '@/lib/analyzers/mobileAnalyzer';
import { analyzeSecurity } from '@/lib/analyzers/securityAnalyzer';
import { analyzeSchema } from '@/lib/analyzers/schemaAnalyzer';
import { calculateScores } from '@/lib/scoring/scoreCalculator';
import { generateIssues, generateRecommendations } from '@/lib/recommendations/aiRecommendations';
import * as cheerio from 'cheerio';

import type { AuditData } from '@/types/audit';

// ─── In-memory Audit Store ────────────────────────────────────────────────────
// Note: For production, replace with Redis or a database
const auditStore = new Map<string, AuditData>();
const MAX_STORED_AUDITS = 100;

function pruneStore() {
  if (auditStore.size >= MAX_STORED_AUDITS) {
    const firstKey = auditStore.keys().next().value;
    if (firstKey) auditStore.delete(firstKey);
  }
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing audit ID' }, { status: 400 });
  }

  const audit = auditStore.get(id);
  if (!audit) {
    return NextResponse.json(
      { error: 'Audit not found. It may have expired — please run a new audit.' },
      { status: 404 }
    );
  }

  return NextResponse.json(audit);
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url: rawUrl } = body;

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate and normalize URL
    const url = validateUrl(rawUrl);
    if (!url) {
      return NextResponse.json(
        { error: 'Invalid URL. Please enter a valid website URL (e.g., https://example.com)' },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(url);
    const domain = extractDomain(url);
    const auditId = uuidv4();

    // ── Fetch HTML ───────────────────────────────────────────────────────────
    let html = '';
    let fetchError: string | undefined;
    let finalUrl = url;
    let pageTitle: string | undefined;

    try {
      const fetchResult = await fetchHtml(url);
      html = fetchResult.html;
      finalUrl = fetchResult.finalUrl;

      // Extract page title for display
      const $ = cheerio.load(html);
      pageTitle = $('title').first().text().trim() || undefined;
    } catch (err) {
      fetchError = err instanceof Error ? err.message : 'Failed to fetch URL';
      console.warn(`[Audit] Failed to fetch ${url}:`, fetchError);
    }

    // ── Run all analyzers in parallel ────────────────────────────────────────
    const [
      robotsTxt,
      sitemap,
      performanceResult,
    ] = await Promise.all([
      analyzeRobotsTxt(baseUrl),
      analyzeSitemap(baseUrl),
      analyzePerformance(finalUrl, html),
    ]);

    // Sync analyzers (cheerio-based, fast)
    const canonical = analyzeCanonical(html, finalUrl);
    const title = analyzeTitle(html);
    const metaDescription = analyzeMetaDescription(html);
    const headings = analyzeHeadings(html);
    const mobileSEO = analyzeMobile(html);
    const security = analyzeSecurity(finalUrl, html);
    const structuredData = analyzeSchema(html);

    // ── Build audit data ─────────────────────────────────────────────────────
    const partialData = {
      id: auditId,
      url: finalUrl,
      domain,
      timestamp: new Date().toISOString(),
      technicalSEO: { robotsTxt, sitemap, canonical },
      performance: performanceResult,
      onPageSEO: { title, metaDescription, headings },
      mobileSEO,
      security,
      structuredData,
      fetchError,
      pageTitle,
    };

    // ── Calculate scores ─────────────────────────────────────────────────────
    const scores = calculateScores(partialData);

    // ── Generate issues and recommendations ──────────────────────────────────
    const auditDataForIssues: AuditData = {
      ...partialData,
      scores,
      issues: [],
      recommendations: [],
    };

    const issues = generateIssues(auditDataForIssues);
    const recommendations = generateRecommendations({ ...auditDataForIssues, issues });

    // ── Assemble final audit ─────────────────────────────────────────────────
    const auditData: AuditData = {
      ...partialData,
      scores,
      issues,
      recommendations,
    };

    // ── Store and return ─────────────────────────────────────────────────────
    pruneStore();
    auditStore.set(auditId, auditData);

    return NextResponse.json(auditData);
  } catch (err) {
    console.error('[Audit] Unexpected error:', err);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while running the audit. Please try again.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
