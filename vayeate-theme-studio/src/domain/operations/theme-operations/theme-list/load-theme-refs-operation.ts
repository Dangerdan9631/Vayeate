import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Load theme refs from data dir into themes slice (theme map entries from ref list). */
@singleton()
export class LoadThemeRefsOperation {
  constructor(
    private readonly themesStateSetter: ThemesStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(): void {
    this.enqueueBackgroundAction.execute(async() => { 
      const refs = await this.themeGateway.listThemes();
      this.themesStateSetter.getStore().setThemeMapEntries(
        refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
      );
    }, 'Loading themes');
  }
}

