import { singleton } from 'tsyringe';
import { getThemeRefs } from '../../../state/data/themes-state';
import type { ThemeReference } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';

/**
 * Read current theme refs from state. Use in controllers instead of importing domain/state directly.
 */
@singleton()
export class GetThemeRefsOperation {
  constructor(private readonly themesStateGetter: ThemesStore) {}

  /**
   * Runs the get theme refs mutation.
   * @returns ThemeReference[] result.
   */

  execute(): ThemeReference[] {
    return getThemeRefs(this.themesStateGetter.getStore().state.themeMap);
  }
}


