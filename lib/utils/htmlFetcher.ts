/**
 * HTML Fetching utilities with timeout and error handling
 */

const DEFAULT_TIMEOUT = parseInt(process.env.FETCH_TIMEOUT || '15000', 10);

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; SEOAuditBot/1.0; +https://seoaudit.pro)',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Cache-Control': 'no-cache',
};

/**
 * Fetches a URL with a configurable timeout.
 */
export async function fetchWithTimeout(
  url: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: BROWSER_HEADERS,
      redirect: 'follow',
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches HTML content from a URL.
 * Returns the HTML string or throws an error.
 */
export async function fetchHtml(
  url: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<{ html: string; finalUrl: string; statusCode: number }> {
  const response = await fetchWithTimeout(url, timeout);

  if (!response.ok && response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
    // Some servers return wrong content-type, try to fetch anyway
    console.warn(`Unexpected content type: ${contentType}`);
  }

  const html = await response.text();
  return {
    html,
    finalUrl: response.url || url,
    statusCode: response.status,
  };
}

/**
 * Fetches a plain text resource (like robots.txt).
 */
export async function fetchText(
  url: string,
  timeout: number = 8000
): Promise<{ text: string; statusCode: number } | null> {
  try {
    const response = await fetchWithTimeout(url, timeout);
    if (!response.ok) return null;
    const text = await response.text();
    return { text, statusCode: response.status };
  } catch {
    return null;
  }
}
