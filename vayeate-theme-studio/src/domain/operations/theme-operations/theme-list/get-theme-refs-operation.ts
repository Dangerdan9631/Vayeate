import { singleton } from 'tsyringe';
import { getThemeRefs } from '../../../state/theme/themes-state';
import type { ThemeReference } from '../../../../model/schemas';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

/** Read current theme refs from state. Use in controllers instead of importing domain/state directly. */
@singleton()
export class GetThemeRefsOperation {
  constructor(private readonly themesStateGetter: ThemesStateGetter) {}

  execute(): ThemeReference[] {
    return getThemeRefs(this.themesStateGetter.current().themeMap);
  }
}
