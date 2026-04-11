import { singleton } from 'tsyringe';
import { SetCatalogNewTokenKeyOperation } from '../../../operations/catalog-operations/tokens/set-catalog-new-token-key-operation';

@singleton()
export class SetCatalogNewTokenKeyController {
  constructor(private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation) {}

  async run(value: string): Promise<void> {
    this.setCatalogNewTokenKey.execute(value);
  }
}
