import { singleton } from 'tsyringe';
import { LoadCatalogRefsOperation } from '../../../operations/catalog-operations/catalog-list/load-catalog-refs-operation';

@singleton()
export class LoadCatalogPageController {
  constructor(
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
  ) { }

  async run(): Promise<void> {
    await this.loadCatalogRefs.execute();
  }
}
