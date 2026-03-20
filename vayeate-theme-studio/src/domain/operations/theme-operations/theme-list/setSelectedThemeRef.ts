import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { SetState } from '../types';

@singleton()
export class SetSelectedThemeRef {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(ref: ThemeReference | null): void {
    this.appStateSetter.apply({ type: 'SET_SELECTED_THEME_REF', ref });
  }
}

/** @deprecated Use SetSelectedThemeRef class instead. */
export function setSelectedThemeRef(setState: SetState, ref: ThemeReference | null): void {
  setState({ type: 'SET_SELECTED_THEME_REF', ref });
}



