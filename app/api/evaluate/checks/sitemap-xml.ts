import type { CheckFn } from './types';

const MAX_FETCH_TIMEOUT = 3000; // 3 seconds

export const checkSitemapXml: CheckFn = async ({ url }) => {
  let passed = false;
  try {
    const sitemapUrl = `${url.origin}/sitemap.xml`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_FETCH_TIMEOUT);

    try {
      const response = await fetch(sitemapUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Website-Evaluator/1.0 (+https://evaluator.local)',
        },
        signal: controller.signal,
      });

      passed = response.ok;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    passed = false;
  }

  return {
    id: 'sitemap-xml',
    name: 'sitemap.xml',
    description:
      'Le site doit exposer un fichier `/sitemap.xml` à la racine du domaine pour aider les moteurs de recherche à découvrir et indexer toutes les pages.',
    severity: 'medium',
    passed,
  };
};
