import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load theme refs from data dir into themes slice (theme map entries from ref list). */
@singleton()
export class LoadThemeRefsOperation {
  constructor(
    private readonly themesStateSetter: ThemesStore,
    private readonly themeGateway: ThemeGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => { 
      const refs = await this.themeGateway.listThemes();
      this.themesStateSetter.getStore().setThemeMapEntries(
        refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
      );
    }, 'Loading themes');
  }
}

