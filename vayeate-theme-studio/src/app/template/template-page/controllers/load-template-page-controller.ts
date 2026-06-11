import { singleton } from 'tsyringe';
import { LoadTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/load-template-refs-operation';
import { LoadCatalogRefsOperation } from '../../../../domain/catalog/operations/load-catalog-refs-operation';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';

/**
 * Refresh template + catalog ref lists when entering the template tab (store is also populated on app load).
 */
/**
 * Handles TEMPLATE_PAGE_ON_LOAD by initializing template page data.
 */
@singleton()
export class LoadTemplatePageController {
  constructor(
    private readonly loadTemplateRefs: LoadTemplateRefsOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly templateUiStore: TemplateUiStore,
  ) {}

  /**
   * Starts template page load when the page is still unloaded.
   * @returns Nothing; load state updates happen in domain operations.
   */
  run(): void {
    if (this.templateUiStore.getStore().state.pageLoadState !== 'unloaded') return;
    this.loadTemplateRefs.execute();
    this.loadCatalogRefs.execute();
  }
}
