import { singleton } from 'tsyringe';
import { LoadCatalogForDisplayOperation } from '../../../../domain/operations/delete/load-catalog-for-display-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { LoadTemplateOperation } from '../../../../domain/operations/template-operations/template-details/load-template-operation';
import { SetSelectedTemplateRefOperation } from '../../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { deriveUndoContext } from '../../../../model/undo-history';

/**
 * Handles TEMPLATE_TEMPLATES_LIST_ON_COMMIT by selecting and loading a template.
 */
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

  /**
   * Selects a template reference and loads its editor state.
   * @param name Template name from the list commit.
   * @param version Template version from the list commit.
   * @returns Resolves when selection and load complete.
   */
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
