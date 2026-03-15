import { themeService } from '../../../gateway/services/theme-service';
import type { SetStoreState } from '../../../state/store-state-reducer';
import type { SetState } from './types';

/** Load theme refs from data dir into app state and store (entries with isLoaded: false). */
export async function loadThemeRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  const refs = await themeService.listThemes();
  setState({ type: 'SET_THEME_REFS', refs });
  setStoreState({
    type: 'SET_STORE_THEME_ENTRIES',
    entries: refs.map((ref) => ({ name: ref.name, version: ref.version, isLoaded: false, theme: undefined })),
  });
}
