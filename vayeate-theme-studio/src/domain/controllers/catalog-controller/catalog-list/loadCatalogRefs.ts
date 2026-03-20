import { singleton } from 'tsyringe';
import { LoadCatalogRefs } from '../../../operations/catalog-operations';

@singleton()
export class LoadCatalogRefsController {
  constructor(private readonly loadCatalogRefs: LoadCatalogRefs) {}

  async run(): Promise<void> {
    await this.loadCatalogRefs.execute();
  }
}

