import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

/** Set selected preview sample key for scrolling (THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT). */
@injectable()
export class SetThemePreviewSelectedSampleKeyOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', value });
  }
}

/** @deprecated Use SetThemePreviewSelectedSampleKeyOperation class instead. */
export function setThemePreviewSelectedSampleKey(setState: (update: ThemesStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', value });
}

