import type { ThemeReference } from '../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';

export function setThemeRefs(setStoreState: SetStoreState, refs: ThemeReference[]): void {
  setStoreState({
    type: 'SET_STORE_THEME_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
  });
}
