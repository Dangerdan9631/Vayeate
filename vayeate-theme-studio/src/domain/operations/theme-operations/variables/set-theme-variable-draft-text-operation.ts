import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Store a draft text value for in-progress variable edits (for validation display). */
@injectable()
export class SetThemeVariableDraftTextOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(key: string, value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_VARIABLE_DRAFT_TEXT', key, value });
  }
}

/** @deprecated Use SetThemeVariableDraftTextOperation class instead. */
export function setThemeVariableDraftText(setState: (update: AppStateUpdate) => void, key: string, value: string): void {
  setState({ type: 'SET_THEME_VARIABLE_DRAFT_TEXT', key, value });
}

