/**
 * Metadata Analyzer
 * Analyzes title tags, meta descriptions, and other metadata.
 */

import * as cheerio from 'cheerio';
import type { TitleResult, MetaDescriptionResult } from '../../types/audit';

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_DESC_MIN = 120;
const META_DESC_MAX = 160;

// ─── Title Analysis ───────────────────────────────────────────────────────────

export function analyzeTitle(html: string): TitleResult {
  const $ = cheerio.load(html);
  const titleEl = $('title');
  const issues: string[] = [];

  if (titleEl.length === 0) {
    return {
      content: '',
      length: 0,
      isOptimalLength: false,
      issues: ['Missing title tag — this is critical for SEO'],
    };
  }

  const content = titleEl.first().text().trim();
  const length = content.length;

  if (!content) {
    issues.push('Title tag is empty');
  } else {
    if (length < TITLE_MIN) {
      issues.push(
        `Title is too short (${length} chars). Aim for ${TITLE_MIN}–${TITLE_MAX} characters.`
      );
    } else if (length > TITLE_MAX) {
      issues.push(
        `Title is too long (${length} chars). Search engines may truncate it. Aim for ${TITLE_MIN}–${TITLE_MAX} characters.`
      );
    }
  }

  // Check for duplicate title tags
  if (titleEl.length > 1) {
    issues.push('Multiple title tags detected');
  }

  // Check for keyword stuffing patterns
  if (content.includes('|') && content.split('|').length > 3) {
    issues.push('Title may be over-optimized with too many pipe separators');
  }

  return {
    content,
    length,
    isOptimalLength: length >= TITLE_MIN && length <= TITLE_MAX,
    issues,
  };
}

// ─── Meta Description Analysis ────────────────────────────────────────────────

export function analyzeMetaDescription(html: string): MetaDescriptionResult {
  const $ = cheerio.load(html);
  const metaEl = $('meta[name="description"]');
  const issues: string[] = [];

  if (metaEl.length === 0) {
    return {
      content: '',
      length: 0,
      isOptimalLength: false,
      issues: [
        'Missing meta description — affects click-through rate from search results',
      ],
    };
  }

  const content = metaEl.first().attr('content')?.trim() || '';
  const length = content.length;

  if (!content) {
    issues.push('Meta description is empty');
  } else {
    if (length < META_DESC_MIN) {
      issues.push(
        `Meta description is too short (${length} chars). Aim for ${META_DESC_MIN}–${META_DESC_MAX} characters.`
      );
    } else if (length > META_DESC_MAX) {
      issues.push(
        `Meta description is too long (${length} chars). May be truncated in SERPs. Aim for ${META_DESC_MIN}–${META_DESC_MAX} characters.`
      );
    }
  }

  // Check for duplicate meta descriptions
  if (metaEl.length > 1) {
    issues.push('Multiple meta description tags detected');
  }

  return {
    content,
    length,
    isOptimalLength: length >= META_DESC_MIN && length <= META_DESC_MAX,
    issues,
  };
}
