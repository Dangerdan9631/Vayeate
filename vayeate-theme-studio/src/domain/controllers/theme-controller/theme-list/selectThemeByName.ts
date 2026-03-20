import { findBestVersionRef } from '../../../utils/version';
import { getThemeRefs, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { selectThemeAndLoad } from './selectThemeAndLoad';

export async function selectThemeByName(
  setState: SetState,
  getState: GetState,
  name: string,
): Promise<void> {
  const best = findBestVersionRef(getThemeRefs(getState), name);
  if (!best) return;
  await selectThemeAndLoad(setState, best.name, best.version);
}
