import { singleton } from 'tsyringe';
import { LoadThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

@singleton()
export class LoadThemePageController {
  constructor(
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly themeUiStore: ThemeUiStore,
  ) {}

  run(): void {
    if (this.themeUiStore.getStore().state.pageLoadState !== 'unloaded') return;
    this.loadThemeRefs.execute();
  }
}
