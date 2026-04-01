import { injectable } from 'tsyringe';
import type { CatalogType } from '../../../../model/schemas';
import { AppStateGetter } from '../../../state/app-state-getter';

export type CatalogCreateDialogData = {
  createFormName: string;
  createFormType: CatalogType;
};

/** Read current catalog create-dialog draft fields from app state. */
@injectable()
export class GetCatalogCreateDialogDataOperation {
  constructor(private readonly appStateGetter: AppStateGetter) {}

  execute(): CatalogCreateDialogData {
    const { createFormName, createFormType } = this.appStateGetter.current().catalogs;
    return { createFormName, createFormType };
  }
}
