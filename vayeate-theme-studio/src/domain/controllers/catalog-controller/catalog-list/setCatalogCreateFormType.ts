import type { CatalogType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogCreateFormType } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogCreateFormTypeController {
  constructor(private readonly setCatalogCreateFormType: SetCatalogCreateFormType) {}

  run(value: CatalogType): void {
    this.setCatalogCreateFormType.execute(value);
  }
}
