import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { nextPatchVersion } from '../../../utils/version';

@singleton()
export class BumpCatalogVersionForEditOperation {
  execute(catalog: Catalog): Catalog {
    return catalog.locked
      ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
      : catalog;
  }
}
