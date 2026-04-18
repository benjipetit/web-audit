import type { CheckFn } from './types';

const MAX_FAVICON_FETCH_TIMEOUT = 3000; // 3 seconds

export const checkFavicon: CheckFn = async ({ $, url }) => {
  const faviconDeclared = $('link[rel]').filter((_, el) => {
    const rel = ($( el).attr('rel') || '').toLowerCase();
    return rel.split(/\s+/).includes('icon');
  }).length > 0;

  let passed = false;
  if (faviconDeclared) {
    passed = true;
  } else {
    try {
      const defaultFaviconUrl = `${url.origin}/favicon.ico`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MAX_FAVICON_FETCH_TIMEOUT);

      try {
        const faviconResponse = await fetch(defaultFaviconUrl, {
          method: 'GET',
          headers: {
            Range: 'bytes=0-2047',
            'User-Agent': 'Website-Evaluator/1.0 (+https://evaluator.local)',
          },
          signal: controller.signal,
        });

        passed = faviconResponse.ok;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {
      passed = false;
    }
  }

  return {
    id: 'favicon',
    name: 'Favicon',
    description:
      "La page doit avoir une icône (favicon). Elle peut être déclarée via `<link rel=\"... icon ...\">` ou être disponible par défaut via `/favicon.ico`.",
    severity: 'medium',
    passed,
  };
};
