import { injectable } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schemas';
import { StoreStateSetter } from '../../../state/store-state-setter';
import type { SetStoreState } from '../../../state/store-state-reducer';

@injectable()
export class SetThemeRefsOperation {
  constructor(private readonly storeStateSetter: StoreStateSetter) {}

  execute(refs: ThemeReference[]): void {
    this.storeStateSetter.apply({
      type: 'SET_STORE_THEME_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
    });
  }
}

/** @deprecated Use SetThemeRefsOperation class instead. */
export function setThemeRefs(setStoreState: SetStoreState, refs: ThemeReference[]): void {
  setStoreState({
    type: 'SET_STORE_THEME_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
  });
}
