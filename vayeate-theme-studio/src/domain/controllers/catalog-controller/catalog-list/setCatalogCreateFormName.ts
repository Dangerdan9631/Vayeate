import { singleton } from 'tsyringe';
import { SetCatalogCreateFormName } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogCreateFormNameController {
  constructor(private readonly setCatalogCreateFormName: SetCatalogCreateFormName) {}

  run(value: string): void {
    this.setCatalogCreateFormName.execute(value);
  }
}
