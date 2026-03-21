import { injectable } from 'tsyringe';
import { ThemeService } from '../../../../gateway/services/theme-service';
import { StoreStateSetter } from '../../../state/store-state-setter';

/** Load theme refs from data dir into store (set theme entries from ref list). */
@injectable()
export class LoadThemeRefs {
  constructor(
    private readonly storeStateSetter: StoreStateSetter,
    private readonly themeService: ThemeService,
  ) {}

  async execute(): Promise<void> {
    const refs = await this.themeService.listThemes();
    this.storeStateSetter.apply({
      type: 'SET_STORE_THEME_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
    });
  }
}



