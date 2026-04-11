import { singleton } from 'tsyringe';
import { SetCatalogNewSourceUrlOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-url-operation';

@singleton()
export class SetCatalogNewSourceUrlController {
  constructor(private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlOperation) {}

  async run(value: string): Promise<void> {
    this.setCatalogNewSourceUrl.execute(value);
  }
}
