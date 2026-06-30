import type { Catalog } from '../../../model/schema/catalog';

import type { CatalogSourceFieldUndoValue } from '../../../model/catalog-source-undo';

import type {

  CatalogLifecycleUndoSnapshot,

  CatalogRevertedToVersionUndoBefore,

} from '../../../model/catalog-undo-lifecycle';

import {

  CATALOG_CREATED,

  CATALOG_REVERTED_TO_VERSION,

  CATALOG_SOURCE_URL_UPDATED,

  CATALOG_UNDO_ACTION_TYPES,

  CATALOG_VERSION_DELETED,

} from '../../../model/undo-action-types';

import type { UndoAction } from '../../core/undo-stack-types';

import type { UndoDiffHandler } from '../../core/undo-processor';

import type { ApplyCatalogLifecycleUndoOperation } from './apply-catalog-lifecycle-undo-operation';

import type { ApplyCatalogSourceUrlUndoOperation } from './apply-catalog-source-url-undo-operation';

import type { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';



const LIFECYCLE_ACTION_TYPES = new Set<string>([

  CATALOG_VERSION_DELETED,

  CATALOG_CREATED,

  CATALOG_REVERTED_TO_VERSION,

]);



const FIELD_LEVEL_ACTION_TYPES = new Set<string>([

  CATALOG_SOURCE_URL_UPDATED,

]);



/**

 * Input or state shape for catalog undo handler deps.

 */

export interface CatalogUndoHandlerDeps {

  applyCatalogUndoState: ApplyCatalogUndoStateOperation;

  applyCatalogLifecycleUndo: ApplyCatalogLifecycleUndoOperation;

  applyCatalogSourceUrlUndo: ApplyCatalogSourceUrlUndoOperation;

}



/**

 * Builds catalog undo diff handlers for snapshot and lifecycle action types.

 * @param deps Operations used to apply catalog undo and lifecycle replay.

 * @returns Handler list wired for the universal undo processor.

 */

export function buildCatalogUndoHandlers(deps: CatalogUndoHandlerDeps): UndoDiffHandler[] {

  const snapshotHandlers = CATALOG_UNDO_ACTION_TYPES

    .filter((actionType) => !LIFECYCLE_ACTION_TYPES.has(actionType) && !FIELD_LEVEL_ACTION_TYPES.has(actionType))

    .map((actionType) => ({

      actionType,

      apply: (action: UndoAction) => deps.applyCatalogUndoState.execute(action.after as Catalog),

      revert: (action: UndoAction) => deps.applyCatalogUndoState.execute(action.before as Catalog),

    }));



  const fieldHandlers: UndoDiffHandler[] = [

    {

      actionType: CATALOG_SOURCE_URL_UPDATED,

      apply: (action) => deps.applyCatalogSourceUrlUndo.execute(action.after as CatalogSourceFieldUndoValue),

      revert: (action) => deps.applyCatalogSourceUrlUndo.execute(action.before as CatalogSourceFieldUndoValue),

    },

  ];



  const lifecycleHandlers: UndoDiffHandler[] = [

    {

      actionType: CATALOG_VERSION_DELETED,

      apply: (action) => deps.applyCatalogLifecycleUndo.applyVersionDeleted(

        action.before as CatalogLifecycleUndoSnapshot,

        action.after as CatalogLifecycleUndoSnapshot,

      ),

      revert: (action) => deps.applyCatalogLifecycleUndo.revertVersionDeleted(

        action.before as CatalogLifecycleUndoSnapshot,

      ),

    },

    {

      actionType: CATALOG_CREATED,

      apply: (action) => deps.applyCatalogLifecycleUndo.applyCreated(

        action.after as CatalogLifecycleUndoSnapshot,

      ),

      revert: (action) => deps.applyCatalogLifecycleUndo.revertCreated(

        action.before as CatalogLifecycleUndoSnapshot,

        action.after as CatalogLifecycleUndoSnapshot,

      ),

    },

    {

      actionType: CATALOG_REVERTED_TO_VERSION,

      apply: (action) => deps.applyCatalogLifecycleUndo.applyRevertedToVersion(action.after as Catalog),

      revert: (action) => deps.applyCatalogLifecycleUndo.revertRevertedToVersion(

        action.before as CatalogRevertedToVersionUndoBefore,

      ),

    },

  ];



  return [...snapshotHandlers, ...fieldHandlers, ...lifecycleHandlers];

}

