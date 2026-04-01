import { singleton } from 'tsyringe';
import { SetCatalogNewSourceUrlOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewSourceUrlController {
  constructor(private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlOperation) {}

  run(value: string): void {
    this.setCatalogNewSourceUrl.execute(value);
  }
}
