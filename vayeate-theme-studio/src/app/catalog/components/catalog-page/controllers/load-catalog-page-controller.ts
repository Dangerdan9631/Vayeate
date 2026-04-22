import { singleton } from 'tsyringe';
import { LoadCatalogRefsOperation } from '../../../../../domain/operations/catalog-operations/catalog-list/load-catalog-refs-operation';

@singleton()
export class LoadCatalogPageController {
  constructor(
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
  ) { }

  run(): void {
    this.loadCatalogRefs.execute();
  }
}
