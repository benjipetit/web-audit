import type { CheckFn } from './types';

const MAX_FETCH_TIMEOUT = 3000; // 3 seconds

export const checkLlmsTxt: CheckFn = async ({ url }) => {
  let passed = false;
  try {
    const llmsUrl = `${url.origin}/llms.txt`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_FETCH_TIMEOUT);

    try {
      const response = await fetch(llmsUrl, {
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
    id: 'llms-txt',
    name: 'llms.txt',
    description:
      'Le site doit exposer un fichier `/llms.txt` à la racine du domaine pour décrire son contenu aux modèles de langage (LLM).',
    severity: 'medium',
    passed,
  };
};
