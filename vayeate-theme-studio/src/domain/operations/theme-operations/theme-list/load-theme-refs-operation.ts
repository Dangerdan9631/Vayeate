import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load theme refs from data dir into themes slice (theme map entries from ref list). */
@singleton()
export class LoadThemeRefsOperation {
  constructor(
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly themeGateway: ThemeGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => { 
      const refs = await this.themeGateway.listThemes();
      this.themesStateSetter.apply({
        type: 'SET_THEME_MAP_ENTRIES',
        entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
      });
    }, 'Loading themes');
  }
}



