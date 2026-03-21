import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogService } from '../../../../gateway/services/catalog-service';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class LoadCatalog {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly catalogService: CatalogService,
  ) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    const loaded = await this.catalogService.loadCatalog(name, version);
    this.appStateSetter.apply({ type: 'SET_CATALOG', catalog: loaded });
    return loaded;
  }
}



