import type { SourceType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceType } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewSourceTypeController {
  constructor(private readonly setCatalogNewSourceType: SetCatalogNewSourceType) {}

  run(value: SourceType): void {
    this.setCatalogNewSourceType.execute(value);
  }
}
