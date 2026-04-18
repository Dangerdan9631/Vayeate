import type { SourceType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTypeOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-type-operation';

@singleton()
export class SetCatalogNewSourceTypeController {
  constructor(private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation) {}

  run(value: SourceType): void {
    this.setCatalogNewSourceType.execute(value);
  }
}
