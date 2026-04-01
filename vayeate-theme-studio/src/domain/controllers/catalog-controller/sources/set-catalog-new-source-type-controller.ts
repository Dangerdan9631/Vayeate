import type { SourceType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTypeOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewSourceTypeController {
  constructor(private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation) {}

  run(value: SourceType): void {
    this.setCatalogNewSourceType.execute(value);
  }
}
