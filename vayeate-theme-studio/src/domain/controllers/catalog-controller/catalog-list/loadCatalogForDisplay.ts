import { singleton } from 'tsyringe';
import { LoadCatalogForDisplay } from '../../../operations/catalog-operations';

@singleton()
export class LoadCatalogForDisplayController {
  constructor(private readonly loadCatalogForDisplay: LoadCatalogForDisplay) {}

  async run(name: string, version: string): Promise<void> {
    await this.loadCatalogForDisplay.execute(name, version);
  }
}
