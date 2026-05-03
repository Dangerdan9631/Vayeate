import type { Theme, ThemeReference } from '../../../model/schema/theme-schemas';

export interface ThemeEntry {
  isLoaded: boolean;
  theme: Theme | undefined;
}

export type ThemeStoreMap = Record<string, Record<string, ThemeEntry>>;

export interface ThemesState {
  themeMap: ThemeStoreMap;
}

export const initialThemesState: ThemesState = {
  themeMap: {},
};

export function getThemeRefs(map: ThemeStoreMap): ThemeReference[] {
  const refs: ThemeReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}
