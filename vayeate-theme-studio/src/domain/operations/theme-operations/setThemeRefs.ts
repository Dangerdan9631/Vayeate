import type { ThemeReference } from '../../../model/schemas';
import type { SetState } from './types';

export function setThemeRefs(setState: SetState, refs: ThemeReference[]): void {
  setState({ type: 'SET_THEME_REFS', refs });
}
