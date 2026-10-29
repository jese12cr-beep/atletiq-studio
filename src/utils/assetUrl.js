/**
 * ATLETIQ Engine - Central Asset URL Resolver
 * Ensures all static assets (.mirl, .fish, .png, .svg) resolve correctly
 * on both root domain (localhost / custom domain) and subpath deployments (GitHub Pages).
 */

export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // External, data, or blob URLs are untouched
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Determine base path
  let base = import.meta.env?.BASE_URL || '/';

  // Subpath detection fallback (e.g. GitHub Pages https://<user>.github.io/ATLETIQ-STUDIO/)
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.includes('/ATLETIQ-STUDIO')) {
      base = '/ATLETIQ-STUDIO/';
    }
  }

  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;

  return `${cleanBase}${cleanPath}`;
}
