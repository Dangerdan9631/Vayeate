import { singleton } from 'tsyringe';
import { LoadCatalogForDisplay } from '../../../operations/catalog-operations';

@singleton()
export class LoadCatalogsForDisplayController {
  constructor(private readonly loadCatalogForDisplay: LoadCatalogForDisplay) {}

  async run(refs: Array<{ name: string; version: string }>): Promise<void> {
    for (const ref of refs) {
      await this.loadCatalogForDisplay.execute(ref.name, ref.version);
    }
  }
}
