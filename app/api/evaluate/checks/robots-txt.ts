import type { CheckFn } from './types';

const MAX_FETCH_TIMEOUT = 3000; // 3 seconds

export const checkRobotsTxt: CheckFn = async ({ url }) => {
  let passed = false;
  try {
    const robotsUrl = `${url.origin}/robots.txt`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_FETCH_TIMEOUT);

    try {
      const response = await fetch(robotsUrl, {
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
    id: 'robots-txt',
    name: 'robots.txt',
    description:
      'Le site doit exposer un fichier `/robots.txt` à la racine du domaine pour indiquer aux robots d\'exploration quelles pages peuvent être indexées.',
    severity: 'medium',
    passed,
  };
};
