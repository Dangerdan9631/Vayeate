import type { Theme, ThemeReference } from '../../../model/schema/theme-schemas';

/**
 * Load status and optional theme payload for one name/version entry in the theme map.
 */
export interface ThemeEntry {
  isLoaded: boolean;
  theme: Theme | undefined;
}

/**
 * Nested map of theme versions keyed by theme name then version string.
 */
export type ThemeStoreMap = Record<string, Record<string, ThemeEntry>>;

/**
 * In-memory cache of theme entities indexed by name and version.
 */
export interface ThemesState {
  themeMap: ThemeStoreMap;
}

/**
 * Empty themes cache before catalogs or themes are loaded.
 */
export const initialThemesState: ThemesState = {
  themeMap: {},
};

/**
 * Collects sorted theme references from every entry in the theme map.
 *
 * @param map Theme versions grouped by name.
 * @returns Stable-sorted list of name/version pairs present in the map.
 */
export function getThemeRefs(map: ThemeStoreMap): ThemeReference[] {
  const refs: ThemeReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

/**
 * Resolves a loaded theme for the given reference, if present and fully loaded.
 *
 * @param themeMap Theme versions grouped by name.
 * @param ref Name and version to look up.
 * @returns The loaded theme, or null when missing or not yet loaded.
 */
export function getLoadedTheme(themeMap: ThemeStoreMap, ref: ThemeReference): Theme | null {
  const entry = themeMap[ref.name]?.[ref.version];
  if (!entry || !entry.isLoaded || !entry.theme) return null;
  return entry.theme;
}
