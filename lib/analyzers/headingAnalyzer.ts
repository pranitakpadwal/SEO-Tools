/**
 * Heading Structure Analyzer
 * Validates H1–H6 hierarchy and semantic structure.
 */

import * as cheerio from 'cheerio';
import type { HeadingResult } from '../../types/audit';

export function analyzeHeadings(html: string): HeadingResult {
  const $ = cheerio.load(html);
  const hierarchyIssues: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractText = (el: any): string[] =>
    el
      .map((_: number, node: unknown) => $(node as Parameters<typeof $>[0]).text().trim())
      .get()
      .filter(Boolean);

  const h1 = extractText($('h1'));
  const h2 = extractText($('h2'));
  const h3 = extractText($('h3'));
  const h4 = extractText($('h4'));
  const h5 = extractText($('h5'));
  const h6 = extractText($('h6'));

  const isMissingH1 = h1.length === 0;
  const hasMultipleH1 = h1.length > 1;

  // H1 checks
  if (isMissingH1) {
    hierarchyIssues.push(
      'Missing H1 tag — every page should have exactly one H1'
    );
  }
  if (hasMultipleH1) {
    hierarchyIssues.push(
      `${h1.length} H1 tags found — use only one H1 per page`
    );
  }

  // Hierarchy checks: H3 without H2, H4 without H3, etc.
  if (h3.length > 0 && h2.length === 0) {
    hierarchyIssues.push(
      'H3 headings found without H2 — breaks heading hierarchy'
    );
  }
  if (h4.length > 0 && h3.length === 0) {
    hierarchyIssues.push(
      'H4 headings found without H3 — breaks heading hierarchy'
    );
  }
  if (h5.length > 0 && h4.length === 0) {
    hierarchyIssues.push('H5 headings found without H4 — breaks heading hierarchy');
  }

  // H1 length check
  if (h1.length === 1 && h1[0].length > 70) {
    hierarchyIssues.push('H1 is very long (>70 chars). Consider shortening it.');
  }

  // Empty headings check
  const allHeadings = [
    ...($('h1, h2, h3, h4, h5, h6').map((_, el) => ({
      tag: el.tagName,
      text: $(el).text().trim(),
    })).get()),
  ];

  const emptyHeadings = allHeadings.filter((h) => !h.text);
  if (emptyHeadings.length > 0) {
    hierarchyIssues.push(
      `${emptyHeadings.length} empty heading tag(s) found`
    );
  }

  const totalHeadings = h1.length + h2.length + h3.length + h4.length + h5.length + h6.length;

  return {
    h1: h1.slice(0, 5),
    h2: h2.slice(0, 10),
    h3: h3.slice(0, 10),
    h4: h4.slice(0, 5),
    h5: h5.slice(0, 5),
    h6: h6.slice(0, 5),
    hasMultipleH1,
    isMissingH1,
    hierarchyIssues,
    totalHeadings,
  };
}
