import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Define the evaluation rules
export const EVALUATION_RULES = [
  {
    id: 'meta-title',
    name: "Balise 'title'",
    description: "Une page doit avoir un titre. Il sert aux visiteurs, mais aussi au référencement naturel de votre site",
    regex: /<title[^>]*>(.+?)<\/title>/i,
    severity: 'critical' as const,
  },
  {
    id: 'meta-description',
    name: 'Meta Description',
    description: "Une page doit une description. Elle optimise le référencement naturel de votre site",
    regex: /<meta\s+name=["']description["']\s+content=["'](.+?)["']/i,
    severity: 'high' as const,
  },
  {
    id: 'alt-text',
    name: "Attribut 'alt' sur les images",
    description: "Les images doivent comporter un texte alternatif pour faciliter l'accessibilité. Cela aide les lecteurs d'écran et le référencement naturel.",
    regex: /<img[^>]+alt=["']([^"']+)["']/i,
    severity: 'medium' as const,
  },
  {
    id: 'viewport',
    name: "Balise meta 'viewport'",
    description: "Votre site doit être adapté au mobile. Indispensable pour le 'responsive design' et le référencement mobile.",
    regex: /<meta\s+name=["']viewport["']/i,
    severity: 'critical' as const,
  },
  {
    id: 'charset',
    name: 'Encodage des caractères',
    description: "La page doit spécifier l'encodage des caractères (UTF-8). Cela garantit un affichage correct du texte.",
    regex: /<meta\s+charset/i,
    severity: 'high' as const,
  },
];

// Constants for size limits
const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5MB
const MAX_FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_FAVICON_FETCH_TIMEOUT = 3000; // 3 seconds

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Validate URL format
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Vous devez entrer une URL.' },
        { status: 400 }
      );
    }

    // Validate it's a valid URL
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Format d'URL invalide." },
        { status: 400 }
      );
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { error: 'Seules les URLs HTTP et HTTPS sont autorisées.' },
        { status: 400 }
      );
    }

    // Fetch the content with timeout and size limits
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MAX_FETCH_TIMEOUT);

      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Website-Evaluator/1.0 (+https://evaluator.local)',
        },
      });

      clearTimeout(timeoutId);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Chargement trop long. L'URL ne répond pas, ou répond trop lentement." },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: 'Impossible de télécharger le contenu de cette URL' },
        { status: 400 }
      );
    }

    // Check if response is successful
    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${response.statusText}` },
        { status: 400 }
      );
    }

    // Check content type - must be HTML
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { error: "Le contenu de cette page n'est pas en HTML. L'audit web analyse seulement les pages web HTML." },
        { status: 400 }
      );
    }

    // Check content length header if available
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (contentLength > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          { error: `Page trop lourde (${(contentLength / 1024 / 1024).toFixed(1)}MB). Maximum 5MB autorisés.` },
          { status: 413 }
        );
      }
    }

    // Read and check content length
    const content = await response.text();
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Page trop lourde (${(content.length / 1024 / 1024).toFixed(1)}MB). Maximum 5MB autorisés.` },
        { status: 413 }
      );
    }

    const $ = cheerio.load(content);

    // Favicon check:
    // - Pass if the page declares a favicon via <link rel="... icon ...">
    // - Otherwise, fall back to checking the default root file: /favicon.ico
    const faviconDeclared = $('link[rel]').filter((_, el) => {
      const rel = ($(el).attr('rel') || '').toLowerCase();
      return rel.split(/\s+/).includes('icon');
    }).length > 0;

    let faviconPassed = false;
    if (faviconDeclared) {
      faviconPassed = true;
    } else {
      try {
        const defaultFaviconUrl = `${urlObj.origin}/favicon.ico`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), MAX_FAVICON_FETCH_TIMEOUT);

        try {
          const faviconResponse = await fetch(defaultFaviconUrl, {
            method: 'GET',
            headers: {
              // Keep the download small when supported by the server.
              Range: 'bytes=0-2047',
              'User-Agent': 'Website-Evaluator/1.0 (+https://evaluator.local)',
            },
            signal: controller.signal,
          });

          faviconPassed = faviconResponse.ok;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch {
        faviconPassed = false;
      }
    }

    // Evaluate all rules
    const results = EVALUATION_RULES.map((rule) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      passed: rule.regex.test(content),
    }));
    results.push(
      {
        id: 'h1-tag',
        name: 'Titre H1',
        description: "La page doit comporter au moins une balise H1. C'est important pour l'accessibilité et le référencement naturel.",
        severity: 'high' as const,
        passed: $('h1').length == 1
      }
    );
    results.push(
      {
        id: 'favicon',
        name: 'Favicon',
        description:
          "La page doit avoir une icône (favicon). Elle peut être déclarée via `<link rel=\"... icon ...\">` ou être disponible par défaut via `/favicon.ico`.",
        severity: 'medium' as const,
        passed: faviconPassed,
      }
    );
    results.push(
      {
        id: 'apple-icon',
        name: 'Apple icon',
        description: "Sur iPhone et iPad, cette icône sera utilisée quand un visiteur ajoute votre page sur son écran d'accueil",
        severity: 'medium' as const,
        passed: $('link[rel~="apple-touch-icon"]').length > 0
      }
    );

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    return NextResponse.json({
      url,
      score: {
        passed: passedCount,
        total: totalCount,
        percentage: Math.round((passedCount / totalCount) * 100),
      },
      results,
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    );
  }
}
