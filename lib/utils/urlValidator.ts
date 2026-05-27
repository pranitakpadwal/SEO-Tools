/**
 * URL Validation and normalization utilities
 */

/**
 * Validates and normalizes a URL.
 * Returns the normalized URL string, or null if invalid.
 */
export function validateUrl(input: string): string | null {
  if (!input || typeof input !== 'string') return null;

  let url = input.trim();

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);

    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;

    // Must have a hostname with at least one dot (basic domain validation)
    if (!parsed.hostname || !parsed.hostname.includes('.')) return null;

    // Reject IP addresses with localhost
    if (parsed.hostname === 'localhost') return null;

    // Return normalized URL (without trailing slash for root paths)
    const normalized = parsed.href;
    return normalized.endsWith('/') && parsed.pathname === '/'
      ? normalized.slice(0, -1)
      : normalized;
  } catch {
    return null;
  }
}

/**
 * Extracts the base origin (protocol + hostname) from a URL.
 */
export function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return url;
  }
}

/**
 * Extracts just the domain (hostname) from a URL.
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Checks if a URL is using HTTPS.
 */
export function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Resolves a relative URL against a base URL.
 */
export function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}
