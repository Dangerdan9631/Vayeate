import type { Catalog } from '../../../model/schema/catalog';
import { CATALOG_UNDO_ACTION_TYPES } from '../../../model/undo-action-types';
import type { UndoDiffHandler } from '../../core/undo-processor';
import type { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';

export function buildCatalogUndoHandlers(
  applyCatalogUndoState: ApplyCatalogUndoStateOperation,
): UndoDiffHandler[] {
  return CATALOG_UNDO_ACTION_TYPES.map((actionType) => ({
    actionType,
    apply: (action) => applyCatalogUndoState.execute(action.after as Catalog),
    revert: (action) => applyCatalogUndoState.execute(action.before as Catalog),
  }));
}
