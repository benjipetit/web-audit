import type { CheckFn } from './types';

export const checkCanonical: CheckFn = async ({ $, url }) => {
  const canonicalElements = $('link[rel]').filter((_, el) => {
    const rel = ($( el).attr('rel') || '').toLowerCase();
    return rel.split(/\s+/).includes('canonical');
  });

  let passed = true;
  if (canonicalElements.length !== 1) {
    passed = false;
  } else {
    const href = canonicalElements.first().attr('href');
    if (!href?.startsWith("https://")) {
        passed = false;
    }
  }

  return {
    id: 'canonical',
    name: 'URL canonique',
    description:
      "La page doit avoir une URL canonique. Cela permet à Google de mieux comprendre quel lien montrer pour votre page et améliore votre visibilité. Il est préférable de choisir une URL commençant par 'https://'",
    severity: 'high',
    passed,
  };
};
