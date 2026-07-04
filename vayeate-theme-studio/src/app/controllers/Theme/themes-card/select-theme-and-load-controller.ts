import { singleton } from 'tsyringe';
import { ApplyThemeStateOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/apply-theme-state-operation';
import { LoadThemeWithLinkedTemplateOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/load-theme-with-linked-template-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/Theme/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/Theme/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';

/**
 * Orchestrates select theme and load work for the theme UI.
 */
@singleton()
export class SelectThemeAndLoadController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadThemeWithLinkedTemplate: LoadThemeWithLinkedTemplateOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly applyThemeState: ApplyThemeStateOperation,
    private readonly catalogUiStore?: CatalogUiStore,
    private readonly templateUiStore?: TemplateUiStore,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param name Input for this call.
 * @param version Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(name: string, version: string): Promise<void> {
    const themeRef = { name, version };
    this.setSelectedThemeRef.execute(themeRef);
    await this.setCurrentUndoStackId?.executeAndLoadForContext(deriveUndoContext({
      tabId: 'themes',
      catalogRef: this.catalogUiStore?.getStore().state.selectedRef ?? null,
      templateRef: this.templateUiStore?.getStore().state.selectedRef ?? null,
      themeRef,
    }));
    this.loadThemeWithLinkedTemplate.execute(name, version)
    .then('Loading theme', async () => {
      const theme = this.themeUiStore.getStore().state.theme;
      if (!theme) return;
      this.setThemePaneSelections.execute(
        theme.colorAssignments.map((assignment) => assignment.colorRef),
        theme.contrastAssignments.map((assignment) => assignment.contrastVariableRef),
      );
      if (theme) this.applyThemeState.execute(theme);
      await this.setCurrentUndoStackId?.executeAndLoadForContext(deriveUndoContext({
        tabId: 'themes',
        catalogRef: this.catalogUiStore?.getStore().state.selectedRef ?? null,
        templateRef: theme.templateRef,
        themeRef,
      }));

    });

  }
}
