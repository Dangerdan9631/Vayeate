import { singleton } from 'tsyringe';
import { LoadThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

/**
 * Orchestrates load theme page work for the theme UI.
 */
@singleton()
export class LoadThemePageController {
  constructor(
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly themeUiStore: ThemeUiStore,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Promise resolved when orchestration completes.
   */
  run(): void {
    if (this.themeUiStore.getStore().state.pageLoadState !== 'unloaded') return;
    this.loadThemeRefs.execute();
  }
}
