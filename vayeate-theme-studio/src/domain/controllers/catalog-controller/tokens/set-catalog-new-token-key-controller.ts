import { singleton } from 'tsyringe';
import { SetCatalogNewTokenKeyOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewTokenKeyController {
  constructor(private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation) {}

  run(value: string): void {
    this.setCatalogNewTokenKey.execute(value);
  }
}
