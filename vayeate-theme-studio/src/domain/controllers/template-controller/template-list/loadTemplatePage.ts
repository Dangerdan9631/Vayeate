import { singleton } from 'tsyringe';
import { LoadTemplateRefs } from '../../../operations/template-operations';
import { LoadCatalogRefs } from '../../../operations/catalog-operations';

/** Refresh template + catalog ref lists when entering the template tab (store is also populated on app load). */
@singleton()
export class LoadTemplatePageController {
  constructor(
    private readonly loadTemplateRefs: LoadTemplateRefs,
    private readonly loadCatalogRefs: LoadCatalogRefs,
  ) {}

  async run(): Promise<void> {
    await this.loadTemplateRefs.execute();
    await this.loadCatalogRefs.execute();
  }
}
