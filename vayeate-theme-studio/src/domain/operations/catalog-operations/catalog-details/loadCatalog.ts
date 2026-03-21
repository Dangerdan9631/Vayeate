import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class LoadCatalog {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    const loaded = await catalogService.loadCatalog(name, version);
    this.appStateSetter.apply({ type: 'SET_CATALOG', catalog: loaded });
    return loaded;
  }
}



