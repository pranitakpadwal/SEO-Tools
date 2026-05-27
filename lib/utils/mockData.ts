/**
 * Sample mock audit data for testing and development.
 * Use this to preview the UI without making real HTTP requests.
 */

import type { AuditData } from '../../types/audit';

export const MOCK_AUDIT_DATA: AuditData = {
  id: 'mock-audit-001',
  url: 'https://example.com',
  domain: 'example.com',
  pageTitle: 'Example Domain',
  timestamp: new Date().toISOString(),

  scores: {
    overall: 72,
    technicalSEO: 78,
    performance: 65,
    onPageSEO: 82,
    structuredData: 45,
    mobileSEO: 90,
  },

  technicalSEO: {
    robotsTxt: {
      exists: true,
      isValid: true,
      content: 'User-agent: *\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml',
      disallowedPaths: ['/admin/'],
      issues: [],
    },
    sitemap: {
      exists: true,
      url: 'https://example.com/sitemap.xml',
      isValid: true,
      urlCount: 42,
      issues: [],
    },
    canonical: {
      hasCanonical: true,
      canonicalUrl: 'https://example.com/',
      hasMismatch: false,
      pageUrl: 'https://example.com/',
      issues: [],
    },
  },

  performance: {
    lcp: {
      value: 2800,
      unit: 'ms',
      status: 'needs-improvement',
      displayValue: '2.8 s',
      description: 'Largest Contentful Paint — time for the largest visible element to load',
      threshold: { good: 2500, poor: 4000 },
    },
    cls: {
      value: 0.08,
      unit: '',
      status: 'good',
      displayValue: '0.080',
      description: 'Cumulative Layout Shift — visual stability of the page',
      threshold: { good: 0.1, poor: 0.25 },
    },
    inp: {
      value: 220,
      unit: 'ms',
      status: 'needs-improvement',
      displayValue: '220 ms',
      description: 'Interaction to Next Paint — responsiveness to user interactions',
      threshold: { good: 200, poor: 500 },
    },
    ttfb: {
      value: 580,
      unit: 'ms',
      status: 'good',
      displayValue: '580 ms',
      description: 'Time to First Byte — server response time',
      threshold: { good: 800, poor: 1800 },
    },
    fcp: {
      value: 1600,
      unit: 'ms',
      status: 'good',
      displayValue: '1.6 s',
      description: 'First Contentful Paint — time for first content to appear',
      threshold: { good: 1800, poor: 3000 },
    },
    tbt: {
      value: 350,
      unit: 'ms',
      status: 'needs-improvement',
      displayValue: '350 ms',
      description: 'Total Blocking Time — total time main thread was blocked',
      threshold: { good: 200, poor: 600 },
    },
    performanceScore: 65,
    renderBlockingScripts: [
      'https://example.com/assets/vendor.js',
      'https://fonts.googleapis.com/css2?family=Inter',
    ],
    imageIssues: [
      { src: 'https://example.com/hero.jpg', issue: 'Missing alt attribute' },
      { src: 'https://example.com/team.jpg', issue: 'Missing width/height attributes — may cause layout shift (CLS)', alt: '' },
      { src: 'https://example.com/banner.png', issue: 'Image not using lazy loading', alt: 'banner' },
    ],
    lazyLoadingIssues: ['https://example.com/footer-image.jpg'],
    jsBundleSize: 45000,
    totalPageSize: 1240000,
    isEstimated: true,
  },

  onPageSEO: {
    title: {
      content: 'Example Domain — Welcome to Example',
      length: 38,
      isOptimalLength: true,
      issues: [],
    },
    metaDescription: {
      content: 'This is an example website used to demonstrate SEO audit capabilities.',
      length: 71,
      isOptimalLength: false,
      issues: ['Meta description is too short (71 chars). Aim for 120–160 characters.'],
    },
    headings: {
      h1: ['Example Domain'],
      h2: ['About Us', 'Our Services', 'Why Choose Us'],
      h3: ['Web Design', 'SEO Services', 'Content Marketing', 'PPC Advertising'],
      h4: [],
      h5: [],
      h6: [],
      hasMultipleH1: false,
      isMissingH1: false,
      hierarchyIssues: [],
      totalHeadings: 8,
    },
  },

  mobileSEO: {
    hasViewportTag: true,
    viewportContent: 'width=device-width, initial-scale=1',
    isViewportOptimal: true,
    issues: [],
  },

  security: {
    isHttps: true,
    hasMixedContent: false,
    mixedContentUrls: [],
    issues: [],
  },

  structuredData: {
    hasSchema: true,
    schemas: [
      {
        type: 'Organization',
        raw: '{"@context":"https://schema.org","@type":"Organization","name":"Example"}',
        properties: { '@context': 'https://schema.org', '@type': 'Organization', name: 'Example' },
      },
    ],
    schemaTypes: ['Organization'],
    issues: [],
  },

  issues: [
    {
      id: 'perf-render-blocking',
      severity: 'medium',
      category: 'Performance',
      title: '2 render-blocking resource(s) detected',
      description: 'Render-blocking scripts and stylesheets delay the browser from displaying your page content.',
      recommendation: 'Add `defer` or `async` to JavaScript tags. Inline critical CSS and defer non-critical stylesheets.',
    },
    {
      id: 'onpage-meta-desc-length',
      severity: 'medium',
      category: 'On-Page SEO',
      title: 'Meta description is too short (71 chars)',
      description: 'Your meta description is below the optimal 120-160 character range.',
      recommendation: 'Expand your meta description to 120-160 characters with a compelling description and call-to-action.',
    },
    {
      id: 'schema-missing-types',
      severity: 'low',
      category: 'Structured Data',
      title: 'Limited schema coverage',
      description: 'Only Organization schema detected. Adding more schema types can unlock rich results.',
      recommendation: 'Add WebSite, BreadcrumbList, and page-specific schemas like Article or FAQPage.',
    },
    {
      id: 'perf-lcp',
      severity: 'medium',
      category: 'Performance',
      title: 'Slow Largest Contentful Paint (2.8 s)',
      description: 'LCP measures how long it takes for the largest visible element to load.',
      recommendation: 'Optimize images, preload key resources, and remove render-blocking resources.',
    },
  ],

  recommendations: [
    {
      id: 'rec-render-blocking',
      priority: 'high',
      category: 'Performance',
      title: 'Eliminate render-blocking JavaScript',
      description: '2 script(s) are blocking page render. Add defer/async attributes.',
      impact: 'Can improve LCP and FCP by 200-800ms',
      effortLevel: 'medium',
    },
    {
      id: 'rec-meta-desc',
      priority: 'medium',
      category: 'On-Page SEO',
      title: 'Expand meta description to 120-160 characters',
      description: 'Your 71-char description misses keyword opportunities and CTR potential.',
      impact: 'Can improve CTR by 5-20%',
      effortLevel: 'low',
    },
    {
      id: 'rec-schema',
      priority: 'medium',
      category: 'Structured Data',
      title: 'Add BreadcrumbList and FAQPage schema',
      description: 'Expand schema coverage to unlock breadcrumb and FAQ rich results in Google.',
      impact: 'Enables rich snippets in search results',
      effortLevel: 'medium',
    },
    {
      id: 'rec-lazy-loading',
      priority: 'medium',
      category: 'Performance',
      title: 'Implement lazy loading for below-fold images',
      description: 'Add loading="lazy" to images not visible on initial page load.',
      impact: 'Reduces initial page weight by 20-60%',
      effortLevel: 'low',
    },
  ],
};
