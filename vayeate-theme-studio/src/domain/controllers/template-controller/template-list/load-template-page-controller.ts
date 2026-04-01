import { singleton } from 'tsyringe';
import { LoadTemplateRefsOperation } from '../../../operations/template-operations';
import { LoadCatalogRefsOperation } from '../../../operations/catalog-operations';

/** Refresh template + catalog ref lists when entering the template tab (store is also populated on app load). */
@singleton()
export class LoadTemplatePageController {
  constructor(
    private readonly loadTemplateRefs: LoadTemplateRefsOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
  ) {}

  async run(): Promise<void> {
    await this.loadTemplateRefs.execute();
    await this.loadCatalogRefs.execute();
  }
}
