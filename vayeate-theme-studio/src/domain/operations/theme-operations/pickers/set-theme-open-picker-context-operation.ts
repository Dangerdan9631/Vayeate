import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

/** Set the active color picker context key (identifies which picker is open). Pass null to close. */
@injectable()
export class SetThemeOpenPickerContextOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(context: string | null): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_OPEN_PICKER_CONTEXT', context });
  }
}

/** @deprecated Use SetThemeOpenPickerContextOperation class instead. */
export function setThemeOpenPickerContext(setState: (update: ThemesStateUpdate) => void, context: string | null): void {
  setState({ type: 'SET_THEME_OPEN_PICKER_CONTEXT', context });
}

