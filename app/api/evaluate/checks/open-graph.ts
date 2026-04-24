import type { CheckFn } from './types';

export const checkOpenGraph: CheckFn = ({ $ }) => {
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
  const ogDescription = $('meta[property="og:description"]').attr('content')?.trim();
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim();
  const ogUrl = $('meta[property="og:url"]').attr('content')?.trim();

  const passed = !!(ogTitle && ogDescription && ogImage && ogUrl);

  return {
    id: 'open-graph',
    name: 'Balises Open Graph',
    description:
      'La page doit avoir les quatre balises Open Graph essentielles (og:title, og:description, og:image, og:url) pour un partage optimisé sur les réseaux sociaux.',
    severity: 'medium',
    passed,
  };
};
