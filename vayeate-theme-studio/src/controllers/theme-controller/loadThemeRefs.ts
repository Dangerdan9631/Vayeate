import { loadThemeRefs as loadThemeRefsOp, type SetState } from '../../operations/theme-operations';

export async function loadThemeRefs(setState: SetState): Promise<void> {
  await loadThemeRefsOp(setState);
}
