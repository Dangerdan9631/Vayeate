import { themeService } from '../../../gateway/services/theme-service';
import type { SetStoreState } from '../../state/store-state-reducer';
import type { SetState } from './types';

/** Load theme refs from data dir into store (set theme entries from ref list). */
export async function loadThemeRefs(_setState: SetState, setStoreState: SetStoreState): Promise<void> {
  const refs = await themeService.listThemes();
  setStoreState({
    type: 'SET_STORE_THEME_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
  });
}
