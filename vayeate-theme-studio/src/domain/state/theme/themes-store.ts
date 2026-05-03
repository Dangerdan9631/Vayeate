import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import type { Theme } from '../../../model/schema/theme-schemas';
import { initialThemesState, type ThemeStoreMap, type ThemesState } from './themes-state';

export interface ThemeEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  theme?: Theme;
}

export interface ThemesStoreState {
  state: ThemesState;
  setThemeMapEntry: (name: string, version: string, isLoaded: boolean, theme?: Theme) => void;
  setThemeMapEntries: (entries: ThemeEntryInput[]) => void;
}

@singleton()
export class ThemesStore {
  private store = createStore<ThemesStoreState>()(
    immer((set): ThemesStoreState => ({
        state: initialThemesState,
        setThemeMapEntry: (name: string, version: string, isLoaded: boolean, theme?: Theme) =>
          set((storeState) => {
            const state = storeState.state;
            const byVersion = {
              ...state.themeMap[name],
              [version]: { isLoaded, theme: theme ?? undefined },
            };
            storeState.state.themeMap = castDraft({ ...state.themeMap, [name]: byVersion });
          }),
        setThemeMapEntries: (entries: ThemeEntryInput[]) =>
          set((storeState) => {
            storeState.state.themeMap = castDraft(entries.reduce((themeMap, entry) => {
              if (!themeMap[entry.name]) {
                themeMap[entry.name] = {};
              }
              themeMap[entry.name]![entry.version] = {
                isLoaded: entry.isLoaded,
                theme: entry.theme ?? undefined,
              };
              return themeMap;
            }, {} as ThemeStoreMap));
          }),
    })),
  );

  get api() {
    return this.store;
  }

  getStore(): ThemesStoreState {
    return this.store.getState();
  }
}

