import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Define the evaluation rules
export const EVALUATION_RULES = [
  {
    id: 'meta-title',
    name: 'Meta Title Tag',
    description: 'Page must have a meta title tag. Essential for SEO and browser tab display.',
    regex: /<title[^>]*>(.+?)<\/title>/i,
    severity: 'critical' as const,
  },
  {
    id: 'meta-description',
    name: 'Meta Description',
    description: 'Page must have a meta description tag. Improves SEO and click-through rates.',
    regex: /<meta\s+name=["']description["']\s+content=["'](.+?)["']/i,
    severity: 'high' as const,
  },
  {
    id: 'alt-text',
    name: 'Image Alt Attributes',
    description: 'Images should have alt text for accessibility. Helps screen readers and SEO.',
    regex: /<img[^>]+alt=["']([^"']+)["']/i,
    severity: 'medium' as const,
  },
  {
    id: 'viewport',
    name: 'Viewport Meta Tag',
    description: 'Mobile viewport must be configured. Essential for responsive design and mobile SEO.',
    regex: /<meta\s+name=["']viewport["']/i,
    severity: 'critical' as const,
  },
  {
    id: 'charset',
    name: 'Character Encoding',
    description: 'Page must specify character encoding (UTF-8). Ensures proper text rendering.',
    regex: /<meta\s+charset/i,
    severity: 'high' as const,
  },
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
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate it's a valid URL
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
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
          { error: 'Request timeout - page took too long to load' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
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
        { error: 'Content is not HTML. Only HTML pages are supported.' },
        { status: 400 }
      );
    }

    // Check content length header if available
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (contentLength > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          { error: `Page too large (${(contentLength / 1024 / 1024).toFixed(1)}MB). Maximum 5MB allowed.` },
          { status: 413 }
        );
      }
    }

    // Read and check content length
    const content = await response.text();
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Page too large (${(content.length / 1024 / 1024).toFixed(1)}MB). Maximum 5MB allowed.` },
        { status: 413 }
      );
    }

    const $ = cheerio.load(content);

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
        name: 'H1 Heading',
        description: 'Page must have at least one H1 tag. Important for accessibility and SEO hierarchy.',
        severity: 'high' as const,
        passed: $('h1').length == 1
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
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
