import { singleton } from 'tsyringe';
import type { CatalogType } from '../../../../model/schema/primitives';
import { CreateCatalogDialogStore } from '../../../state/ui/create-catalog-dialog-store';

/**
 * Updates catalog create dialog data in the domain or UI store.
 */

@singleton()
export class SetCatalogCreateDialogDataOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  /**
   * Runs the set catalog create dialog data mutation.
   * @param options Options ({ name?: string, type?: CatalogType }).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(options: { name?: string, type?: CatalogType }): void {
    this.createCatalogDialogStore.getStore().setCreateCatalogDialogData(options.name, options.type);
  }
}
