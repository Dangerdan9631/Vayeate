import { singleton } from 'tsyringe';
import { ApplyThemeStateOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-operation';
import { GetThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/get-theme-refs-operation';
import { LoadThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeLoadedTemplateOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadTemplateSnapshotOperation } from '../../../../domain/operations/template-operations/template-details/load-template-snapshot-operation';
import { findBestVersionRef } from '../../../../domain/utils/find-best-version-ref';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

/**
 * Orchestrates select theme by name work for the theme UI.
 */
@singleton()
export class SelectThemeByNameController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly getThemeRefs: GetThemeRefsOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly applyThemeState: ApplyThemeStateOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param name Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(name: string): Promise<void> {
    const best = findBestVersionRef(this.getThemeRefs.execute(), name);
    if (!best) return;
    this.setSelectedThemeRef.execute({ name: best.name, version: best.version });
    this.loadTheme.execute(best.name, best.version)
      .then('Loading theme', async () => {
        const theme = this.themeUiStore.getStore().state.theme;
        if (!theme) return;
        this.setThemePaneSelections.execute([], []);
        const template =
          theme?.templateRef != null
            ? await this.loadTemplateSnapshot.execute(theme.templateRef.name, theme.templateRef.version)
            : null;
        if (theme) this.applyThemeState.execute(theme);
        this.setThemeLoadedTemplate.execute(template);
      });
  }
}
