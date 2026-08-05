import { singleton } from 'tsyringe';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/Catalog/delete/set-selected-catalog-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';

/**
 * Updates the selected catalog ref and switches undo context for the catalogs tab.
 */
@singleton()
export class SetSelectedCatalogController {
  constructor(
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly templateUiStore?: TemplateUiStore,
    private readonly themeUiStore?: ThemeUiStore,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Selects a catalog by name and version.
   * @param name - Catalog name from the picker.
   * @param version - Catalog version from the picker.
   * @returns Promise that settles when undo stack hydration completes.
   */
  async run(name: string, version: string): Promise<void> {
    const ref = { name, version };
    this.setSelectedCatalog.execute(ref);
    await this.setCurrentUndoStackId?.executeAndLoadForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: ref,
      templateRef: this.templateUiStore?.getStore().state.selectedRef ?? null,
      themeRef: this.themeUiStore?.getStore().state.selectedRef ?? null,
    }));
  }
}
