import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

/** Clear preview variable list filter (THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK). */
@injectable()
export class SetThemePreviewVariableFilterClearOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value: '' });
  }
}

/** @deprecated Use SetThemePreviewVariableFilterClearOperation class instead. */
export function setThemePreviewVariableFilterClear(setState: (update: ThemesStateUpdate) => void): void {
  setState({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value: '' });
}

