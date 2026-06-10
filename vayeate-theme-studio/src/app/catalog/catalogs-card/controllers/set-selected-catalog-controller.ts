import { singleton } from 'tsyringe';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/delete/set-selected-catalog-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';

@singleton()
export class SetSelectedCatalogController {
  constructor(
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly templateUiStore?: TemplateUiStore,
    private readonly themeUiStore?: ThemeUiStore,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

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
