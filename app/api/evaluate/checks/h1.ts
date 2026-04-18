import type { CheckFn } from './types';

export const checkH1: CheckFn = ({ $ }) => ({
  id: 'h1-tag',
  name: 'Titre H1',
  description: "La page doit comporter au moins une balise H1. C'est important pour l'accessibilité et le référencement naturel.",
  severity: 'high',
  passed: $('h1').length === 1,
});
