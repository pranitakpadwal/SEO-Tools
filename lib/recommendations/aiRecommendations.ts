/**
 * AI Recommendations Engine
 * Generates context-aware, actionable SEO recommendations based on audit findings.
 */

import type { AuditData, Issue, Recommendation } from '../../types/audit';

// ─── Issue Generator ─────────────────────────────────────────────────────────

export function generateIssues(data: AuditData): Issue[] {
  const issues: Issue[] = [];

  // ── Technical SEO Issues ─────────────────────────────────────────────────

  if (!data.technicalSEO.robotsTxt.exists) {
    issues.push({
      id: 'tech-robots-missing',
      severity: 'medium',
      category: 'Technical SEO',
      title: 'robots.txt file not found',
      description: 'Your site does not have a robots.txt file. This file tells search engine crawlers which pages they can or cannot access.',
      recommendation: 'Create a robots.txt file at the root of your domain. At minimum, reference your sitemap URL and ensure important pages are not inadvertently blocked.',
    });
  } else if (!data.technicalSEO.robotsTxt.isValid) {
    const firstIssue = data.technicalSEO.robotsTxt.issues[0];
    if (firstIssue?.includes('blocking all crawlers')) {
      issues.push({
        id: 'tech-robots-blocking',
        severity: 'high',
        category: 'Technical SEO',
        title: 'robots.txt is blocking all search crawlers',
        description: 'Your robots.txt has "Disallow: /" which prevents all search engines from indexing your site. This is a critical SEO issue.',
        recommendation: 'Remove or update the "Disallow: /" directive. Only block pages you explicitly do not want indexed (e.g., /admin/, /wp-admin/).',
      });
    } else {
      issues.push({
        id: 'tech-robots-invalid',
        severity: 'low',
        category: 'Technical SEO',
        title: 'robots.txt has configuration issues',
        description: data.technicalSEO.robotsTxt.issues.join('. '),
        recommendation: 'Review and fix the robots.txt configuration. Ensure it has proper User-agent directives and references your sitemap.',
      });
    }
  }

  if (!data.technicalSEO.sitemap.exists) {
    issues.push({
      id: 'tech-sitemap-missing',
      severity: 'high',
      category: 'Technical SEO',
      title: 'XML sitemap not found',
      description: 'No XML sitemap was detected. Sitemaps help search engines discover and crawl your pages more efficiently.',
      recommendation: 'Generate an XML sitemap and submit it to Google Search Console. Make sure to reference it in your robots.txt file.',
    });
  }

  if (!data.technicalSEO.canonical.hasCanonical) {
    issues.push({
      id: 'tech-canonical-missing',
      severity: 'medium',
      category: 'Technical SEO',
      title: 'Missing canonical tag',
      description: 'No canonical tag was found. Without it, search engines may index duplicate versions of your page.',
      recommendation: 'Add a canonical tag in your <head>: <link rel="canonical" href="https://yourdomain.com/page-url" />',
    });
  } else if (data.technicalSEO.canonical.hasMismatch) {
    issues.push({
      id: 'tech-canonical-mismatch',
      severity: 'high',
      category: 'Technical SEO',
      title: 'Canonical URL mismatch',
      description: `The canonical tag points to a different URL than the current page. This can confuse search engines.`,
      recommendation: 'Ensure the canonical tag URL exactly matches the current page URL, or intentionally points to the preferred version.',
    });
  }

  // ── Security Issues ───────────────────────────────────────────────────────

  if (!data.security.isHttps) {
    issues.push({
      id: 'sec-no-https',
      severity: 'high',
      category: 'Security',
      title: 'Site is not using HTTPS',
      description: 'Your site is served over HTTP, not HTTPS. Google uses HTTPS as a ranking signal and browsers warn users about insecure connections.',
      recommendation: 'Install an SSL/TLS certificate and redirect all HTTP traffic to HTTPS. Many hosting providers offer free SSL certificates via Let\'s Encrypt.',
    });
  }

  if (data.security.hasMixedContent) {
    issues.push({
      id: 'sec-mixed-content',
      severity: 'medium',
      category: 'Security',
      title: 'Mixed content detected',
      description: `${data.security.mixedContentUrls.length} resource(s) are loaded over HTTP on this HTTPS page. Browsers may block these resources.`,
      recommendation: 'Update all resource URLs to use HTTPS. Check scripts, stylesheets, images, and iframes.',
    });
  }

  // ── Performance Issues ────────────────────────────────────────────────────

  if (data.performance.lcp.status !== 'good') {
    issues.push({
      id: 'perf-lcp',
      severity: data.performance.lcp.status === 'poor' ? 'high' : 'medium',
      category: 'Performance',
      title: `Slow Largest Contentful Paint (${data.performance.lcp.displayValue})`,
      description: 'LCP measures how long it takes for the largest visible element to load. A slow LCP hurts user experience and search rankings.',
      recommendation: 'Optimize images, preload key resources, use a CDN, remove render-blocking resources, and improve server response times.',
    });
  }

  if (data.performance.cls.status !== 'good') {
    issues.push({
      id: 'perf-cls',
      severity: data.performance.cls.status === 'poor' ? 'high' : 'medium',
      category: 'Performance',
      title: `High Cumulative Layout Shift (${data.performance.cls.displayValue})`,
      description: 'CLS measures unexpected visual movement on the page. High CLS creates a poor user experience.',
      recommendation: 'Add size attributes to images and embeds, avoid inserting content above existing content, and reserve space for dynamic content.',
    });
  }

  if (data.performance.ttfb.status !== 'good') {
    issues.push({
      id: 'perf-ttfb',
      severity: 'medium',
      category: 'Performance',
      title: `Slow Time to First Byte (${data.performance.ttfb.displayValue})`,
      description: 'TTFB measures server response time. A slow TTFB delays all other page loading.',
      recommendation: 'Optimize server infrastructure, use caching, consider a CDN, and minimize server-side processing time.',
    });
  }

  if (data.performance.renderBlockingScripts.length > 0) {
    issues.push({
      id: 'perf-render-blocking',
      severity: 'medium',
      category: 'Performance',
      title: `${data.performance.renderBlockingScripts.length} render-blocking resource(s) detected`,
      description: 'Render-blocking scripts and stylesheets delay the browser from displaying your page content.',
      recommendation: 'Add `defer` or `async` to JavaScript tags. Inline critical CSS and defer non-critical stylesheets.',
    });
  }

  if (data.performance.imageIssues.length > 3) {
    issues.push({
      id: 'perf-images',
      severity: 'medium',
      category: 'Performance',
      title: `${data.performance.imageIssues.length} image optimization issues found`,
      description: 'Multiple images have optimization issues including missing alt text, missing dimensions, or missing lazy loading.',
      recommendation: 'Add alt attributes to all images, specify width/height to prevent CLS, and use loading="lazy" for below-the-fold images.',
    });
  }

  // ── On-Page SEO Issues ────────────────────────────────────────────────────

  if (!data.onPageSEO.title.content) {
    issues.push({
      id: 'onpage-title-missing',
      severity: 'high',
      category: 'On-Page SEO',
      title: 'Missing title tag',
      description: 'Your page has no title tag. This is one of the most important on-page SEO elements and directly impacts search rankings.',
      recommendation: 'Add a unique, descriptive title tag between 30-60 characters that includes your primary keyword.',
    });
  } else if (!data.onPageSEO.title.isOptimalLength) {
    const len = data.onPageSEO.title.length;
    issues.push({
      id: 'onpage-title-length',
      severity: 'medium',
      category: 'On-Page SEO',
      title: `Title tag length is ${len < 30 ? 'too short' : 'too long'} (${len} chars)`,
      description: len < 30
        ? 'Your title is too short and may not rank well. Short titles miss opportunities to include keywords.'
        : 'Your title exceeds 60 characters and may be truncated in search results, hurting click-through rates.',
      recommendation: 'Rewrite your title to be 30-60 characters. Include your primary keyword near the beginning.',
    });
  }

  if (!data.onPageSEO.metaDescription.content) {
    issues.push({
      id: 'onpage-meta-desc-missing',
      severity: 'medium',
      category: 'On-Page SEO',
      title: 'Missing meta description',
      description: 'No meta description found. While not a direct ranking factor, it significantly impacts click-through rate from search results.',
      recommendation: 'Write a compelling meta description of 120-160 characters that summarizes the page content and encourages clicks.',
    });
  } else if (!data.onPageSEO.metaDescription.isOptimalLength) {
    issues.push({
      id: 'onpage-meta-desc-length',
      severity: 'low',
      category: 'On-Page SEO',
      title: `Meta description length needs improvement (${data.onPageSEO.metaDescription.length} chars)`,
      description: 'Your meta description length is outside the optimal 120-160 character range.',
      recommendation: 'Rewrite your meta description to be 120-160 characters. Make it descriptive and include a call-to-action.',
    });
  }

  if (data.onPageSEO.headings.isMissingH1) {
    issues.push({
      id: 'onpage-h1-missing',
      severity: 'high',
      category: 'On-Page SEO',
      title: 'Missing H1 heading',
      description: 'No H1 tag found. The H1 is the primary heading and a critical signal for what your page is about.',
      recommendation: 'Add a single, descriptive H1 heading that includes your primary keyword and clearly describes the page content.',
    });
  } else if (data.onPageSEO.headings.hasMultipleH1) {
    issues.push({
      id: 'onpage-h1-multiple',
      severity: 'medium',
      category: 'On-Page SEO',
      title: `${data.onPageSEO.headings.h1.length} H1 headings found (should be 1)`,
      description: 'Multiple H1 tags can confuse search engines about the primary topic of your page.',
      recommendation: 'Keep exactly one H1 per page. Convert additional H1s to H2 or H3 headings as appropriate.',
    });
  }

  if (data.onPageSEO.headings.hierarchyIssues.length > 0) {
    issues.push({
      id: 'onpage-heading-hierarchy',
      severity: 'low',
      category: 'On-Page SEO',
      title: 'Heading hierarchy issues detected',
      description: data.onPageSEO.headings.hierarchyIssues.join('. '),
      recommendation: 'Use headings in order: H1 → H2 → H3 → H4. Do not skip heading levels.',
    });
  }

  // ── Mobile SEO Issues ─────────────────────────────────────────────────────

  if (!data.mobileSEO.hasViewportTag) {
    issues.push({
      id: 'mobile-viewport-missing',
      severity: 'high',
      category: 'Mobile SEO',
      title: 'Missing viewport meta tag',
      description: 'No viewport meta tag found. Without it, mobile browsers will render the page at desktop width, making it unusable on mobile.',
      recommendation: 'Add: <meta name="viewport" content="width=device-width, initial-scale=1"> in your <head>.',
    });
  } else if (!data.mobileSEO.isViewportOptimal) {
    issues.push({
      id: 'mobile-viewport-misconfigured',
      severity: 'medium',
      category: 'Mobile SEO',
      title: 'Viewport meta tag is not optimally configured',
      description: 'The viewport tag exists but is not configured correctly for mobile-first display.',
      recommendation: 'Update to: <meta name="viewport" content="width=device-width, initial-scale=1">',
    });
  }

  // ── Structured Data Issues ────────────────────────────────────────────────

  if (!data.structuredData.hasSchema) {
    issues.push({
      id: 'schema-missing',
      severity: 'medium',
      category: 'Structured Data',
      title: 'No structured data (schema) found',
      description: 'No schema markup detected. Structured data helps search engines understand your content and enables rich results in SERPs.',
      recommendation: 'Add JSON-LD schema markup. Start with Organization or WebSite schema, then add page-specific types like Article, Product, or FAQ.',
    });
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ─── Recommendation Generator ─────────────────────────────────────────────────

export function generateRecommendations(data: AuditData): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const scores = data.scores;

  // Performance recommendations
  if (scores.performance < 90) {
    if (data.performance.renderBlockingScripts.length > 0) {
      recommendations.push({
        id: 'rec-render-blocking',
        priority: 'high',
        category: 'Performance',
        title: 'Eliminate render-blocking JavaScript',
        description: `${data.performance.renderBlockingScripts.length} script(s) are blocking page render. Add defer/async attributes or move scripts to the end of <body>.`,
        impact: 'Can improve LCP and FCP by 200-800ms',
        effortLevel: 'medium',
      });
    }

    if (data.performance.imageIssues.filter(i => i.issue.includes('lazy')).length > 2) {
      recommendations.push({
        id: 'rec-lazy-loading',
        priority: 'medium',
        category: 'Performance',
        title: 'Implement lazy loading for below-fold images',
        description: 'Add loading="lazy" to images that are not visible on initial page load. This reduces initial page load time significantly.',
        impact: 'Reduces initial page weight by 20-60%, improves LCP',
        effortLevel: 'low',
      });
    }

    if (data.performance.lcp.status !== 'good') {
      recommendations.push({
        id: 'rec-optimize-lcp',
        priority: 'high',
        category: 'Performance',
        title: 'Optimize the LCP element (above-the-fold images/text)',
        description: 'Preload the LCP resource with <link rel="preload">, use next-gen image formats (WebP/AVIF), and ensure the LCP element is server-rendered.',
        impact: `Improve LCP from ${data.performance.lcp.displayValue} toward <2.5s`,
        effortLevel: 'medium',
      });
    }
  }

  // On-page SEO recommendations
  if (scores.onPageSEO < 90) {
    if (data.onPageSEO.title.content && data.onPageSEO.title.isOptimalLength) {
      recommendations.push({
        id: 'rec-title-ctr',
        priority: 'medium',
        category: 'On-Page SEO',
        title: 'Improve title tag CTR with intent modifiers',
        description: 'Your title tag length is good. Boost click-through rate by adding power words like "Ultimate Guide", "Step-by-Step", "2024", or "Free" to signal search intent.',
        impact: 'Can improve organic CTR by 10-30%',
        effortLevel: 'low',
      });
    }

    if (!data.onPageSEO.metaDescription.content || !data.onPageSEO.metaDescription.isOptimalLength) {
      recommendations.push({
        id: 'rec-meta-desc',
        priority: 'medium',
        category: 'On-Page SEO',
        title: 'Write a compelling meta description',
        description: 'A well-crafted meta description acts as ad copy for your organic listing. Include your primary keyword, a value proposition, and a call to action.',
        impact: 'Can improve CTR by 5-20%',
        effortLevel: 'low',
      });
    }
  }

  // Structured data recommendations
  if (!data.structuredData.hasSchema || scores.structuredData < 70) {
    recommendations.push({
      id: 'rec-schema',
      priority: data.structuredData.hasSchema ? 'low' : 'medium',
      category: 'Structured Data',
      title: data.structuredData.hasSchema
        ? 'Expand structured data coverage'
        : 'Add structured data markup',
      description: data.structuredData.hasSchema
        ? 'You have some schema, but adding more types (FAQPage, BreadcrumbList, Review) can unlock additional rich result types in Google.'
        : 'Implement JSON-LD schema to enable rich results. Start with Organization, WebSite, and page-specific schemas.',
      impact: 'Can increase visibility with rich snippets (stars, FAQs, breadcrumbs in SERPs)',
      effortLevel: 'medium',
    });
  }

  // Technical SEO recommendations
  if (!data.technicalSEO.sitemap.exists) {
    recommendations.push({
      id: 'rec-sitemap',
      priority: 'high',
      category: 'Technical SEO',
      title: 'Create and submit an XML sitemap',
      description: 'An XML sitemap helps Google discover and index all your pages. Create one and submit it through Google Search Console for faster indexation.',
      impact: 'Ensures all pages are discovered and indexed',
      effortLevel: 'low',
    });
  }

  if (!data.technicalSEO.canonical.hasCanonical) {
    recommendations.push({
      id: 'rec-canonical',
      priority: 'medium',
      category: 'Technical SEO',
      title: 'Add canonical tags to prevent duplicate content',
      description: 'Self-referencing canonical tags prevent issues with URL parameters, trailing slashes, and other URL variations that can split link equity.',
      impact: 'Prevents duplicate content penalties and consolidates PageRank',
      effortLevel: 'low',
    });
  }

  // Mobile recommendations
  if (scores.mobileSEO < 80) {
    recommendations.push({
      id: 'rec-mobile',
      priority: 'high',
      category: 'Mobile SEO',
      title: 'Fix mobile SEO configuration',
      description: data.mobileSEO.issues[0] || 'Ensure your site is fully optimized for mobile users. Mobile-first indexing means Google primarily uses the mobile version for ranking.',
      impact: 'Critical for Google mobile-first indexing',
      effortLevel: 'low',
    });
  }

  // Additional smart recommendations based on overall score
  if (scores.overall >= 80) {
    recommendations.push({
      id: 'rec-advanced-seo',
      priority: 'low',
      category: 'Advanced SEO',
      title: 'Consider implementing advanced SEO techniques',
      description: 'Your site has a solid foundation. Next steps: build high-quality backlinks, create topic clusters and pillar pages, optimize for featured snippets, and monitor Core Web Vitals in Search Console.',
      impact: 'Can improve rankings in competitive keywords',
      effortLevel: 'high',
    });
  }

  if (!data.structuredData.schemaTypes.includes('BreadcrumbList') && data.structuredData.hasSchema) {
    recommendations.push({
      id: 'rec-breadcrumb',
      priority: 'low',
      category: 'Structured Data',
      title: 'Add BreadcrumbList schema markup',
      description: 'BreadcrumbList schema enables breadcrumb navigation in Google SERPs, improving visual appearance and click-through rates.',
      impact: 'Enables breadcrumb display in search results',
      effortLevel: 'low',
    });
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 12);
}
