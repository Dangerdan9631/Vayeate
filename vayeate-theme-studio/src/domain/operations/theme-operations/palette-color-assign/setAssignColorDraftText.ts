import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Set draft text for the palette assign-color input (session only). */
@injectable()
export class SetAssignColorDraftText {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_ASSIGN_COLOR_DRAFT_TEXT', value });
  }
}

/** @deprecated Use SetAssignColorDraftText class instead. */
export function setAssignColorDraftText(setState: (update: AppStateUpdate) => void, value: string): void {
  setState({ type: 'SET_ASSIGN_COLOR_DRAFT_TEXT', value });
}

