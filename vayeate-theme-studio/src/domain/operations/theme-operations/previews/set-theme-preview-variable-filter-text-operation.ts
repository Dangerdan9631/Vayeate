import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Set preview variable list filter text (THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE). */
@injectable()
export class SetThemePreviewVariableFilterTextOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value });
  }
}

/** @deprecated Use SetThemePreviewVariableFilterTextOperation class instead. */
export function setThemePreviewVariableFilterText(setState: (update: AppStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value });
}

