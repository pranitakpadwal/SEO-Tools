/**
 * Security Analyzer
 * Checks HTTPS status and mixed content issues.
 */

import * as cheerio from 'cheerio';
import type { SecurityResult } from '../../types/audit';

export function analyzeSecurity(url: string, html: string): SecurityResult {
  const isHttps = url.startsWith('https://');
  const $ = cheerio.load(html);
  const mixedContentUrls: string[] = [];
  const issues: string[] = [];

  if (!isHttps) {
    issues.push(
      'Site is not using HTTPS — insecure connection affects rankings and user trust'
    );
  } else {
    // Check for mixed content (HTTP resources on HTTPS page)
    const selectors = [
      ['script', 'src'],
      ['link', 'href'],
      ['img', 'src'],
      ['video', 'src'],
      ['audio', 'src'],
      ['source', 'src'],
      ['iframe', 'src'],
      ['object', 'data'],
      ['embed', 'src'],
    ] as const;

    for (const [tag, attr] of selectors) {
      $(tag).each((_, el) => {
        const val = $(el).attr(attr);
        if (val && val.startsWith('http://')) {
          if (!mixedContentUrls.includes(val)) {
            mixedContentUrls.push(val);
          }
        }
      });
    }

    if (mixedContentUrls.length > 0) {
      issues.push(
        `${mixedContentUrls.length} mixed content resource(s) found — HTTP resources on an HTTPS page`
      );
    }
  }

  return {
    isHttps,
    hasMixedContent: mixedContentUrls.length > 0,
    mixedContentUrls: mixedContentUrls.slice(0, 10),
    issues,
  };
}
