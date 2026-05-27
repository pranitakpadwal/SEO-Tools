/**
 * Mobile SEO Analyzer
 * Validates viewport meta tag and mobile-friendliness signals.
 */

import * as cheerio from 'cheerio';
import type { MobileSEOResult } from '../../types/audit';

export function analyzeMobile(html: string): MobileSEOResult {
  const $ = cheerio.load(html);
  const issues: string[] = [];

  // ─── Viewport Meta Tag ─────────────────────────────────────────────────────
  const viewportMeta = $('meta[name="viewport"]');
  const hasViewportTag = viewportMeta.length > 0;
  const viewportContent = viewportMeta.first().attr('content')?.trim();

  let isViewportOptimal = false;

  if (!hasViewportTag) {
    issues.push(
      'Missing viewport meta tag — required for mobile responsiveness'
    );
  } else {
    const content = viewportContent || '';
    const hasWidth = content.includes('width=device-width');
    const hasInitialScale = content.includes('initial-scale=1');
    const hasUserScalableNo = content.includes('user-scalable=no');
    const hasMaxScale1 = content.includes('maximum-scale=1');

    isViewportOptimal = hasWidth && hasInitialScale;

    if (!hasWidth) {
      issues.push('Viewport meta tag missing "width=device-width"');
    }
    if (!hasInitialScale) {
      issues.push('Viewport meta tag missing "initial-scale=1"');
    }
    if (hasUserScalableNo || hasMaxScale1) {
      issues.push(
        'Viewport disables user zoom — this hurts accessibility and may impact rankings'
      );
    }
  }

  // ─── Mobile-friendly HTML Signals ──────────────────────────────────────────

  // Check for fixed-width elements that might break mobile layouts
  const fixedWidthElements = $('[style*="width: "][style*="px"]').length;
  if (fixedWidthElements > 5) {
    issues.push(
      `${fixedWidthElements} elements with fixed pixel widths detected — may cause mobile layout issues`
    );
  }

  // Check for tiny font sizes
  const tinyFontEls = $('[style*="font-size: 1"][style*="px"]').length;
  if (tinyFontEls > 0) {
    issues.push('Very small font sizes detected — may be hard to read on mobile');
  }

  // Check for tap target issues (links/buttons without size hints)
  const interactiveEls = $('a, button, input, select, textarea').length;
  if (interactiveEls > 0 && !hasViewportTag) {
    issues.push(
      'Interactive elements found but no viewport tag — tap targets may be too small'
    );
  }

  return {
    hasViewportTag,
    viewportContent,
    isViewportOptimal,
    issues,
  };
}
