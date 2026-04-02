import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

/** Set draft text for the palette assign-color input (session only). */
@injectable()
export class SetAssignColorDraftTextOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_ASSIGN_COLOR_DRAFT_TEXT', value });
  }
}

/** @deprecated Use SetAssignColorDraftTextOperation class instead. */
export function setAssignColorDraftText(setState: (update: ThemesStateUpdate) => void, value: string): void {
  setState({ type: 'SET_ASSIGN_COLOR_DRAFT_TEXT', value });
}

