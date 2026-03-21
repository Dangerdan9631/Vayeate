import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { nextPatchVersion } from '../../../utils/version';

@injectable()
export class BumpCatalogVersionForEdit {
  execute(catalog: Catalog): Catalog {
    return catalog.locked
      ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
      : catalog;
  }
}
