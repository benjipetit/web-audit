import type { CheckFn } from './types';

type RegexRule = {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  regex: RegExp;
  learnMoreUrl?: string;
};

const REGEX_RULES: RegexRule[] = [
  {
    id: 'meta-title',
    name: "Balise 'title'",
    description: "Une page doit avoir un titre. Il sert aux visiteurs, mais aussi au référencement naturel de votre site",
    regex: /<title[^>]*>(.+?)<\/title>/i,
    severity: 'critical',
    learnMoreUrl: 'https://bakpak.fr/ressources/glossaire/balise-titre/',
  },
  {
    id: 'meta-description',
    name: 'Meta Description',
    description: "Une page doit une description. Elle optimise le référencement naturel de votre site",
    regex: /<meta\s+name=["']description["']\s+content=["'](.+?)["']/i,
    severity: 'high',
    learnMoreUrl: 'https://bakpak.fr/ressources/glossaire/seo/',
  },
  {
    id: 'alt-text',
    name: "Attribut 'alt' sur les images",
    description: "Les images doivent comporter un texte alternatif pour faciliter l'accessibilité. Cela aide les lecteurs d'écran et le référencement naturel.",
    regex: /<img[^>]+alt=["']([^"']+)["']/i,
    severity: 'medium',
    learnMoreUrl: 'https://bakpak.fr/ressources/glossaire/seo/',
  },
  {
    id: 'viewport',
    name: "Balise meta 'viewport'",
    description: "Votre site doit être adapté au mobile. Indispensable pour le 'responsive design' et le référencement mobile.",
    regex: /<meta\s+name=["']viewport["']/i,
    severity: 'critical',
    learnMoreUrl: 'https://bakpak.fr/ressources/glossaire/responsive/',
  },
  {
    id: 'charset',
    name: 'Encodage des caractères',
    description: "La page doit spécifier l'encodage des caractères (UTF-8). Cela garantit un affichage correct du texte.",
    regex: /<meta\s+charset/i,
    severity: 'high',
    learnMoreUrl: 'https://bakpak.fr/ressources/glossaire/seo/',
  },
];

export const regexChecks: CheckFn[] = REGEX_RULES.map((rule) => ({ content }) => ({
  id: rule.id,
  name: rule.name,
  description: rule.description,
  severity: rule.severity,
  passed: rule.regex.test(content),
  learnMoreUrl: rule.learnMoreUrl,
}));
