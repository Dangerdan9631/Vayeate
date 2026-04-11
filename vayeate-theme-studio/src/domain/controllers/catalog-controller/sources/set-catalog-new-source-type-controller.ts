import type { SourceType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTypeOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-type-operation';

@singleton()
export class SetCatalogNewSourceTypeController {
  constructor(private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation) {}

  async run(value: SourceType): Promise<void> {
    this.setCatalogNewSourceType.execute(value);
  }
}
