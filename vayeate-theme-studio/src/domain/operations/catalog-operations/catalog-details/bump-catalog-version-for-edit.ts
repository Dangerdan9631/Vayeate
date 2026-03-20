import type { Catalog } from '../../../../model/schemas';
import { nextPatchVersion } from '../../../utils/version';

export function bumpCatalogVersionForEdit(catalog: Catalog): Catalog {
  return catalog.locked
    ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
    : catalog;
}
