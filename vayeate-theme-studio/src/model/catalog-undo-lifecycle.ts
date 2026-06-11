import type { Catalog } from './schema/catalog';
import type { CatalogReference } from './schema/template-schemas';

/**
 * Catalog presence plus UI selection for create/delete undo diffs.
 */
export interface CatalogLifecycleUndoSnapshot {
  catalog: Catalog | null;
  selectedRef: CatalogReference | null;
}

/**
 * State to restore when undoing a catalog revert-to-version action.
 */
export interface CatalogRevertedToVersionUndoBefore {
  deleteVersion: CatalogReference;
  selectedRef: CatalogReference;
}
