import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { LoadThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeLoadedTemplateOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadTemplateSnapshotOperation } from '../../../../domain/operations/template-operations/template-details/load-template-snapshot-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';

@singleton()
export class SelectThemeAndLoadController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
    private readonly catalogUiStore?: CatalogUiStore,
    private readonly templateUiStore?: TemplateUiStore,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

  async run(name: string, version: string): Promise<void> {
    const themeRef = { name, version };
    this.setSelectedThemeRef.execute(themeRef);
    await this.setCurrentUndoStackId?.executeAndLoadForContext(deriveUndoContext({
      tabId: 'themes',
      catalogRef: this.catalogUiStore?.getStore().state.selectedRef ?? null,
      templateRef: this.templateUiStore?.getStore().state.selectedRef ?? null,
      themeRef,
    }));
    this.loadTheme.execute(name, version)
    .then('Loading theme', async () => {
      const theme = this.themeUiStore.getStore().state.theme;
      if (!theme) return;
      this.setThemePaneSelections.execute([], []);
      const template =
        theme?.templateRef != null
          ? await this.loadTemplateSnapshot.execute(theme.templateRef.name, theme.templateRef.version)
          : null;
      if (theme) this.applyThemeStateAndSchedulePersist.execute(theme);
      this.setThemeLoadedTemplate.execute(template);
      await this.setCurrentUndoStackId?.executeAndLoadForContext(deriveUndoContext({
        tabId: 'themes',
        catalogRef: this.catalogUiStore?.getStore().state.selectedRef ?? null,
        templateRef: theme.templateRef,
        themeRef,
      }));

    });

  }
}
