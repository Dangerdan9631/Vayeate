import { singleton } from 'tsyringe';
import { LoadTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/load-template-refs-operation';
import { LoadCatalogRefsOperation } from '../../../../domain/operations/catalog-operations/catalog-list/load-catalog-refs-operation';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';

/** Refresh template + catalog ref lists when entering the template tab (store is also populated on app load). */
@singleton()
export class LoadTemplatePageController {
  constructor(
    private readonly loadTemplateRefs: LoadTemplateRefsOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly templateUiStore: TemplateUiStore,
  ) {}

  run(): void {
    if (this.templateUiStore.getStore().state.pageLoadState !== 'unloaded') return;
    this.loadTemplateRefs.execute();
    this.loadCatalogRefs.execute();
  }
}
