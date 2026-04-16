import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schemas';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeRefsOperation {
  constructor(private readonly themesStateSetter: ThemesStore) {}

  execute(refs: ThemeReference[]): void {
    this.themesStateSetter.getStore().setThemeMapEntries(
      refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
    );
  }
}
