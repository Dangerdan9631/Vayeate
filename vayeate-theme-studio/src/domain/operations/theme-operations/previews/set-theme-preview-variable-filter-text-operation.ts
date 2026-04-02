import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

/** Set preview variable list filter text (THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE). */
@injectable()
export class SetThemePreviewVariableFilterTextOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value });
  }
}

/** @deprecated Use SetThemePreviewVariableFilterTextOperation class instead. */
export function setThemePreviewVariableFilterText(setState: (update: ThemesStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value });
}

