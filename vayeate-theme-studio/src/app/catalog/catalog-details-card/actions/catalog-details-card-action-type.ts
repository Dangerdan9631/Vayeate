import { SourceType, TokenType } from "../../../../model/schema/primitives";
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the catalog details card.
 */
export enum CatalogDetailsCardActionType {
  SourceUrlTextOnCommit = 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_COMMIT',
  SourceTokenTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  SourceTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT',
  SourceRemoveButtonOnClick = 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK',
  NewSourceUrlTextOnChange = 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE',
  NewSourceTokenTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  NewSourceTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT',
  NewSourceAddButtonOnClick = 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK',
  DeleteVersionButtonOnClick = 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  SyncButtonOnClick = 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK',
  LockButtonOnClick = 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK',
  RevertButtonOnClick = 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK',
}

/**
 * Union of catalog details card actions handled by `CatalogDetailsCardHandler`.
 */
export type CatalogDetailsCardActions =
  | { type: CatalogDetailsCardActionType.SourceUrlTextOnCommit; value: string; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.SourceTokenTypeListOnCommit; value: TokenType; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.SourceTypeListOnCommit; value: SourceType; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.SourceRemoveButtonOnClick; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.NewSourceUrlTextOnChange; value: string }
  | { type: CatalogDetailsCardActionType.NewSourceTokenTypeListOnCommit; value: TokenType }
  | { type: CatalogDetailsCardActionType.NewSourceTypeListOnCommit; value: SourceType }
  | { type: CatalogDetailsCardActionType.NewSourceAddButtonOnClick }
  | { type: CatalogDetailsCardActionType.DeleteVersionButtonOnClick }
  | { type: CatalogDetailsCardActionType.SyncButtonOnClick }
  | { type: CatalogDetailsCardActionType.LockButtonOnClick }
  | { type: CatalogDetailsCardActionType.RevertButtonOnClick };


const catalogDetailsCardTypes = new Set<string>(Object.values(CatalogDetailsCardActionType));

/**
 * Narrows an app action to a catalog details card action when the type matches.
 * @param a - Action from the global action queue.
 * @returns True when the action is a catalog details card action.
 */
export function isCatalogDetailsCardAction(a: AppAction): a is CatalogDetailsCardActions {
  return catalogDetailsCardTypes.has(a.type);
}

const catalogDetailsCardCoalescers: Partial<Record<CatalogDetailsCardActionType, ActionCoalesceFn>> = {
  [CatalogDetailsCardActionType.NewSourceUrlTextOnChange]: coalesceLatest,
};

/**
 * Merges consecutive details card actions of the same type before enqueue.
 * @param pending - Action already waiting in the queue tail.
 * @param incoming - New details card action being enqueued.
 * @returns Coalesced action, or null when types differ or no coalescer applies.
 */
export function tryCoalesceCatalogDetailsCardAction(
  pending: CatalogDetailsCardActions,
  incoming: CatalogDetailsCardActions,
): CatalogDetailsCardActions | null {
  const coalesce = catalogDetailsCardCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as CatalogDetailsCardActions) : null;
}
