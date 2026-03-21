import { singleton } from 'tsyringe';
import { SetCatalogNewSourceUrl } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewSourceUrlController {
  constructor(private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrl) {}

  run(value: string): void {
    this.setCatalogNewSourceUrl.execute(value);
  }
}
