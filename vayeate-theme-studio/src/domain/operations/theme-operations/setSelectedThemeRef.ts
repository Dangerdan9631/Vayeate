import type { ThemeReference } from '../../../model/schemas';
import type { SetState } from './types';

export function setSelectedThemeRef(setState: SetState, ref: ThemeReference | null): void {
  setState({ type: 'SET_SELECTED_THEME_REF', ref });
}
