import { getThemeRefsFromStore } from '../../state/store-state';
import { compareVersions } from '../../utils/version';
import type { SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { selectThemeAndLoad } from './selectThemeAndLoad';

export async function selectThemeByName(
  setState: SetState,
  getState: GetState,
  name: string,
): Promise<void> {
  const state = getState();
  const refs = getThemeRefsFromStore(state.store).filter((r) => r.name === name);
  if (refs.length === 0) return;
  const best = refs.reduce((a, b) =>
    compareVersions(a.version, b.version) > 0 ? a : b,
  );
  await selectThemeAndLoad(setState, best.name, best.version);
}
