import { injectable } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

/** Load theme refs from data dir into themes slice (theme map entries from ref list). */
@injectable()
export class LoadThemeRefsOperation {
  constructor(
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly themeGateway: ThemeGateway,
  ) {}

  async execute(): Promise<void> {
    const refs = await this.themeGateway.listThemes();
    this.themesStateSetter.apply({
      type: 'SET_THEME_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
    });
  }
}



