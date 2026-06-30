import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import type { Theme } from '../../../model/schema/theme-schemas';
import { initialThemesState, type ThemeStoreMap, type ThemesState } from './themes-state';

/**
 * Input for upserting one theme map slot during bulk or partial updates.
 */
export interface ThemeEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  theme?: Theme;
}

/**
 * Themes cache snapshot plus mutation methods exposed from the store.
 */
export interface ThemesStoreState {
  state: ThemesState;
  updateTheme: (theme: Theme) => void;
  updateThemes: (themes: Theme[]) => void;
  setThemeMapEntry: (name: string, version: string, isLoaded: boolean, theme?: Theme) => void;
  setThemeMapEntries: (entries: ThemeEntryInput[]) => void;
}

function upsertTheme(themeMap: ThemeStoreMap, theme: Theme): void {
  if (!themeMap[theme.name]) {
    themeMap[theme.name] = {};
  }

  themeMap[theme.name]![theme.version] = {
    isLoaded: true,
    theme: castDraft(theme),
  };
}

/**
 * Zustand store for the in-memory theme entity cache.
 */
@singleton()
export class ThemesStore {
  private store = createStore<ThemesStoreState>()(
    immer((set): ThemesStoreState => ({
        state: initialThemesState,
        updateTheme: (theme: Theme) =>
          set((storeState) => {
            upsertTheme(storeState.state.themeMap, theme);
          }),
        updateThemes: (themes: Theme[]) =>
          set((storeState) => {
            themes.forEach((theme) => {
              upsertTheme(storeState.state.themeMap, theme);
            });
          }),
        setThemeMapEntry: (name: string, version: string, isLoaded: boolean, theme?: Theme) =>
          set((storeState) => {
            const state = storeState.state;
            const byVersion = {
              ...state.themeMap[name],
              [version]: { isLoaded, theme: theme ? castDraft(theme) : undefined },
            };
            storeState.state.themeMap = castDraft({ ...state.themeMap, [name]: byVersion });
          }),
        setThemeMapEntries: (entries: ThemeEntryInput[]) =>
          set((storeState) => {
            const existingThemeMap = storeState.state.themeMap;
            storeState.state.themeMap = castDraft(entries.reduce((themeMap, entry) => {
              if (!themeMap[entry.name]) {
                themeMap[entry.name] = {};
              }
              const existing = existingThemeMap[entry.name]?.[entry.version];
              themeMap[entry.name]![entry.version] = {
                isLoaded: entry.isLoaded || existing?.isLoaded === true,
                theme: entry.theme ? castDraft(entry.theme) : existing?.theme,
              };
              return themeMap;
            }, {} as ThemeStoreMap));
          }),
    })),
  );

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live themes store state and setters.
   */
  getStore(): ThemesStoreState {
    return this.store.getState();
  }
}
