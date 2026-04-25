import { singleton } from 'tsyringe';
import { LoadTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/load-template-refs-operation';
import { LoadCatalogRefsOperation } from '../../../../domain/operations/catalog-operations/catalog-list/load-catalog-refs-operation';

/** Refresh template + catalog ref lists when entering the template tab (store is also populated on app load). */
@singleton()
export class LoadTemplatePageController {
  constructor(
    private readonly loadTemplateRefs: LoadTemplateRefsOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
  ) {}

  run(): void {
    this.loadTemplateRefs.execute();
    this.loadCatalogRefs.execute();
  }
}
