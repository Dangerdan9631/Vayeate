import { singleton } from 'tsyringe';
import { SetCatalogNewTokenKey } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewTokenKeyController {
  constructor(private readonly setCatalogNewTokenKey: SetCatalogNewTokenKey) {}

  run(value: string): void {
    this.setCatalogNewTokenKey.execute(value);
  }
}
