import { singleton } from 'tsyringe';
import { SetCatalogNewTokenKeyOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-new-token-key-operation';

@singleton()
export class SetCatalogNewTokenKeyController {
  constructor(private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation) {}

  run(value: string): void {
    this.setCatalogNewTokenKey.execute(value);
  }
}
