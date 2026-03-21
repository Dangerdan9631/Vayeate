import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Set the active color picker context key (identifies which picker is open). Pass null to close. */
@injectable()
export class SetThemeOpenPickerContext {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(context: string | null): void {
    this.appStateSetter.apply({ type: 'SET_THEME_OPEN_PICKER_CONTEXT', context });
  }
}

/** @deprecated Use SetThemeOpenPickerContext class instead. */
export function setThemeOpenPickerContext(setState: (update: AppStateUpdate) => void, context: string | null): void {
  setState({ type: 'SET_THEME_OPEN_PICKER_CONTEXT', context });
}

