import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';

@injectable()
export class CreateCatalog {
  async execute(params: { name: string; type: 'manual' | 'remote' }): Promise<Catalog> {
    const catalog = await catalogService.createCatalog(params);
    return catalog;
  }
}



