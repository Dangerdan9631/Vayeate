import type { Theme } from '../../model/schema/theme-schemas';

/**
 * Computes color variable keys orphaned relative to the theme's template (placeholder).
 *
 * @param theme - Theme to inspect, or null when no theme is loaded.
 * @returns Set of orphan color keys; empty when theme or template ref is missing.
 */
export function computeOrphanColorKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}

/**
 * Computes contrast variable keys orphaned relative to the theme's template (placeholder).
 *
 * @param theme - Theme to inspect, or null when no theme is loaded.
 * @returns Set of orphan contrast keys; empty when theme or template ref is missing.
 */
export function computeOrphanContrastKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}
