import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Set selected preview sample key for scrolling (THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT). */
@injectable()
export class SetThemePreviewSelectedSampleKey {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', value });
  }
}

/** @deprecated Use SetThemePreviewSelectedSampleKey class instead. */
export function setThemePreviewSelectedSampleKey(setState: (update: AppStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', value });
}

