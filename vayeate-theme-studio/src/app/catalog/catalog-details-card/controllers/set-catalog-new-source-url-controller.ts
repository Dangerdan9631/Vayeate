import { singleton } from 'tsyringe';
import { SetCatalogNewSourceUrlOperation } from '../../../../domain/operations/catalog-operations/sources/set-catalog-new-source-url-operation';

@singleton()
export class SetCatalogNewSourceUrlController {
  constructor(private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlOperation) {}

  run(value: string): void {
    this.setCatalogNewSourceUrl.execute(value);
  }
}
