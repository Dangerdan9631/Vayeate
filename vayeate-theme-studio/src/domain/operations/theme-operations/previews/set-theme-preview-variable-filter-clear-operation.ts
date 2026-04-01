import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Clear preview variable list filter (THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK). */
@injectable()
export class SetThemePreviewVariableFilterClearOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(): void {
    this.appStateSetter.apply({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value: '' });
  }
}

/** @deprecated Use SetThemePreviewVariableFilterClearOperation class instead. */
export function setThemePreviewVariableFilterClear(setState: (update: AppStateUpdate) => void): void {
  setState({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value: '' });
}

