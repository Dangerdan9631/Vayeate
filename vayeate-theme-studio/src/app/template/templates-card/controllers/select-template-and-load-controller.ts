import { singleton } from 'tsyringe';
import { LoadCatalogForDisplayOperation } from '../../../../domain/operations/delete/load-catalog-for-display-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { LoadTemplateOperation } from '../../../../domain/operations/template-operations/template-details/load-template-operation';
import { SetSelectedTemplateRefOperation } from '../../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { deriveUndoContext } from '../../../../model/undo-history';

@singleton()
export class SelectTemplateAndLoadController {
  constructor(
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly loadCatalogForDisplay: LoadCatalogForDisplayOperation,
    private readonly catalogUiStore?: CatalogUiStore,
    private readonly themeUiStore?: ThemeUiStore,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

  async run(name: string, version: string): Promise<void> {
    const ref = { name, version };
    this.setSelectedTemplateRef.execute(ref);
    await this.setCurrentUndoStackId?.executeAndLoadForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: ref,
      catalogRef: this.catalogUiStore?.getStore().state.selectedRef ?? null,
      themeRef: this.themeUiStore?.getStore().state.selectedRef ?? null,
    }));
    const template = await this.loadTemplate.execute(name, version);
    if (template?.catalogRefs?.length) {
      this.loadCatalogForDisplay.execute(Array.from(template.catalogRefs));
    }
  }
}
