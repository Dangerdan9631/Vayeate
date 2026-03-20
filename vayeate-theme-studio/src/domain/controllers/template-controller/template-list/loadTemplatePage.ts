import { singleton } from 'tsyringe';
import { LoadTemplateRefs } from '../../../operations/template-operations';
import { LoadCatalogRefs } from '../../../operations/catalog-operations';

/** Load template refs and catalog refs for the template page. */
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

