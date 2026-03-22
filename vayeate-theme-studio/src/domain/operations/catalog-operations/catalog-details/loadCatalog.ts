import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class LoadCatalog {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    const loaded = await this.catalogGateway.loadCatalog(name, version);
    this.appStateSetter.apply({ type: 'SET_CATALOG', catalog: loaded });
    return loaded;
  }
}



