import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the bulk-add tokens dialog.
 */
export enum CatalogBulkAddDialogActionType {
  TextOnChange = 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE',
  CancelButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK',
  OkButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK',
}

/**
 * Union of bulk-add dialog actions handled by `CatalogBulkAddDialogHandler`.
 */
export type CatalogBulkAddDialogActions =
  | { type: CatalogBulkAddDialogActionType.TextOnChange; value: string }
  | { type: CatalogBulkAddDialogActionType.CancelButtonOnClick }
  | { type: CatalogBulkAddDialogActionType.OkButtonOnClick };


const catalogBulkAddDialogTypes = new Set<string>(Object.values(CatalogBulkAddDialogActionType));

/**
 * Narrows an app action to a bulk-add dialog action when the type matches.
 * @param a - Action from the global action queue.
 * @returns True when the action is a bulk-add dialog action.
 */
export function isCatalogBulkAddDialogAction(a: AppAction): a is CatalogBulkAddDialogActions {
  return catalogBulkAddDialogTypes.has(a.type);
}

const catalogBulkAddDialogCoalescers: Partial<Record<CatalogBulkAddDialogActionType, ActionCoalesceFn>> = {
  [CatalogBulkAddDialogActionType.TextOnChange]: coalesceLatest,
};

/**
 * Merges consecutive bulk-add dialog actions of the same type before enqueue.
 * @param pending - Action already waiting in the queue tail.
 * @param incoming - New bulk-add dialog action being enqueued.
 * @returns Coalesced action, or null when types differ or no coalescer applies.
 */
export function tryCoalesceCatalogBulkAddDialogAction(
  pending: CatalogBulkAddDialogActions,
  incoming: CatalogBulkAddDialogActions,
): CatalogBulkAddDialogActions | null {
  const coalesce = catalogBulkAddDialogCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as CatalogBulkAddDialogActions) : null;
}
