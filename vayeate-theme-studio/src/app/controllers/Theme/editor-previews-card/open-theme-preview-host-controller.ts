import { singleton } from 'tsyringe';
import { OpenThemePreviewHostOperation } from '../../../../domain/operations/Theme/theme-operations/previews/open-theme-preview-host-operation';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';

/**
 * Opens a VS Code extension host for the current selected theme.
 */
@singleton()
export class OpenThemePreviewHostController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly openThemePreviewHost: OpenThemePreviewHostOperation,
  ) {}

  /**
   * Reads the current theme snapshot and starts the preview-host workflow.
   */
  run(): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme?.templateRef) {
      return;
    }

    this.openThemePreviewHost.execute(theme);
  }
}
