/**
 * Structured Data / Schema Analyzer
 * Detects JSON-LD, microdata, and RDFa schema markup.
 */

import * as cheerio from 'cheerio';
import type { StructuredDataResult, SchemaItem } from '../../types/audit';

export function analyzeSchema(html: string): StructuredDataResult {
  const $ = cheerio.load(html);
  const schemas: SchemaItem[] = [];
  const issues: string[] = [];

  // ─── JSON-LD ─────────────────────────────────────────────────────────────
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html() || '';
    try {
      const parsed = JSON.parse(raw);

      // Handle both single objects and arrays
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (item && typeof item === 'object') {
          let type = item['@type'];

          // Handle @graph arrays
          if (!type && item['@graph'] && Array.isArray(item['@graph'])) {
            for (const graphItem of item['@graph']) {
              schemas.push({
                type: graphItem['@type'] || 'Unknown',
                raw: JSON.stringify(graphItem).slice(0, 500),
                properties: graphItem,
              });
            }
            continue;
          }

          // Handle type arrays
          if (Array.isArray(type)) {
            type = type.join(', ');
          }

          schemas.push({
            type: type || 'Unknown',
            raw: JSON.stringify(item).slice(0, 500),
            properties: item,
          });
        }
      }
    } catch {
      issues.push('Invalid JSON-LD found — could not parse structured data');
    }
  });

  // ─── Microdata ────────────────────────────────────────────────────────────
  $('[itemtype]').each((_, el) => {
    const itemtype = $(el).attr('itemtype') || '';
    const typeParts = itemtype.split('/');
    const type = typeParts[typeParts.length - 1] || 'Unknown';

    // Avoid duplicating schema.org types already caught via JSON-LD
    const isDuplicate = schemas.some((s) => s.type === type);
    if (!isDuplicate && type !== 'Unknown') {
      schemas.push({
        type,
        raw: itemtype,
      });
    }
  });

  // ─── Validate common schema issues ────────────────────────────────────────
  if (schemas.length === 0) {
    issues.push(
      'No structured data found — adding schema markup helps search engines understand your content'
    );
  } else {
    // Check for common required fields
    for (const schema of schemas) {
      if (schema.properties) {
        const props = schema.properties as Record<string, unknown>;

        if (schema.type === 'Article' || schema.type === 'NewsArticle') {
          if (!props['headline']) issues.push(`Article schema missing "headline" property`);
          if (!props['author']) issues.push(`Article schema missing "author" property`);
          if (!props['datePublished']) issues.push(`Article schema missing "datePublished" property`);
        }

        if (schema.type === 'Product') {
          if (!props['name']) issues.push(`Product schema missing "name" property`);
          if (!props['description']) issues.push(`Product schema missing "description" property`);
        }

        if (schema.type === 'LocalBusiness') {
          if (!props['name']) issues.push(`LocalBusiness schema missing "name" property`);
          if (!props['address']) issues.push(`LocalBusiness schema missing "address" property`);
        }
      }
    }
  }

  const schemaTypes = [...new Set(schemas.map((s) => s.type))];

  return {
    hasSchema: schemas.length > 0,
    schemas: schemas.slice(0, 10),
    schemaTypes,
    issues: issues.slice(0, 5), // Limit to most important issues
  };
}
