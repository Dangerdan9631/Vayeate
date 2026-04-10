import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schemas';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeRefsOperation {
  constructor(private readonly themesStateSetter: ThemesStateSetter) {}

  execute(refs: ThemeReference[]): void {
    this.themesStateSetter.apply({
      type: 'SET_THEME_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
    });
  }
}
