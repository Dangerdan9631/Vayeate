import { singleton } from 'tsyringe';
import { getThemeRefsFromStore } from '../../../state/store-state';
import type { ThemeReference } from '../../../../model/schemas';
import type { AppState } from '../../../state/app-state';
import { AppStateGetter } from '../../../state/app-state-getter';

/** Read current theme refs from state. Use in controllers instead of importing domain/state directly. */
@singleton()
export class GetThemeRefsOperation {
  constructor(private readonly appStateGetter: AppStateGetter) {}

  execute(): ThemeReference[] {
    return getThemeRefsFromStore(this.appStateGetter.current().store);
  }
}

/** @deprecated Use GetThemeRefsOperation class instead. */
export function getThemeRefs(getState: () => AppState): ThemeReference[] {
  return getThemeRefsFromStore(getState().store);
}


