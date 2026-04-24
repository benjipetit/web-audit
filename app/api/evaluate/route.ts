import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import type { CheckFn } from './checks/types';
import { regexChecks } from './checks/regex-checks';
import { checkH1 } from './checks/h1';
import { checkFavicon } from './checks/favicon';
import { checkAppleIcon } from './checks/check-apple-icon';
import { checkCanonical } from './checks/canonical';
import { checkRobotsTxt } from './checks/robots-txt';
import { checkSitemapXml } from './checks/sitemap-xml';
import { checkLlmsTxt } from './checks/llms-txt';
import { checkOpenGraph } from './checks/open-graph';

const CHECKS: CheckFn[] = [
  ...regexChecks,
  checkH1,
  checkFavicon,
  checkAppleIcon,
  checkCanonical,
  checkRobotsTxt,
  checkSitemapXml,
  checkLlmsTxt,
  checkOpenGraph,
];

// Constants for size limits
const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5MB
const MAX_FETCH_TIMEOUT = 10000; // 10 seconds

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
    let urlObj: URL;
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
    let response: Response;
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

    const page = { content, $: cheerio.load(content), url: urlObj };

    // Run all checks
    const results = await Promise.all(CHECKS.map((check) => check(page)));

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
