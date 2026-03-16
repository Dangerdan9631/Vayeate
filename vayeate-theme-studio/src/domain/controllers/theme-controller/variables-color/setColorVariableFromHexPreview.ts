import type { Theme } from '../../../../model/schemas';
import type { ColorVariableKey } from '../../../../model/schemas';
import { setTheme, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { normalizeHexVar } from '../shared-flows';

/** Live preview only (no persist). For THEME_VARIABLES_*_COLOR_PICKER_ON_SELECT. */
export function setColorVariableFromHexPreview(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  hex: string,
  target: 'dark' | 'light',
): void {
  const theme = getState().themes.theme;
  if (!theme || !ref) return;
  const normalized = normalizeHexVar(hex);
  if (!normalized) return;
  const newAssignments = theme.colorAssignments.map((a) => {
    if (a.colorRef !== ref) return a;
    const next = { ...a };
    if (target === 'dark') next.dark = { value: normalized };
    else next.light = { value: normalized };
    return next;
  });
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
}



