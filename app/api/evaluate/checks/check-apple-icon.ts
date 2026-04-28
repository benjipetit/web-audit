import type { CheckFn } from './types';

export const checkAppleIcon: CheckFn = ({ $ }) => ({
  id: 'apple-icon',
  name: 'Apple icon',
  description: "Sur iPhone et iPad, cette icône sera utilisée quand un visiteur ajoute votre page sur son écran d'accueil",
  severity: 'medium',
  passed: $('link[rel~="apple-touch-icon"]').length > 0,
  learnMoreUrl: 'https://bakpak.fr/ressources/glossaire/responsive/',
});
