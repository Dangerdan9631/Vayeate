import { CatalogCreateDialogActions } from "../create-dialog/actions/catalog-create-dialog-action-type";
import { CatalogsCardActions } from "../catalogs-card/actions/catalogs-card-action-type";
import { CatalogBulkAddDialogActions } from "../bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type";
import { CatalogDetailsCardActions } from "../catalog-details-card/actions/catalog-details-card-action-type";
import { TokensCardActions } from "../tokens-card/actions/tokens-card-action-type";
import { CatalogPageActions } from "../catalog-page/actions/catalog-page-action-type";
import type { AppAction } from '../../core/action-queue/app-action';
import {
  isCatalogBulkAddDialogAction,
  tryCoalesceCatalogBulkAddDialogAction,
} from '../bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type';
import { isCatalogCreateDialogAction } from '../create-dialog/actions/catalog-create-dialog-action-type';
import {
  isCatalogDetailsCardAction,
  tryCoalesceCatalogDetailsCardAction,
} from '../catalog-details-card/actions/catalog-details-card-action-type';
import { isCatalogsCardAction } from '../catalogs-card/actions/catalogs-card-action-type';
import { isTokensCardAction, tryCoalesceTokensCardAction } from '../tokens-card/actions/tokens-card-action-type';
import { isCatalogPageAction } from '../catalog-page/actions/catalog-page-action-type';

/**
 * Union of every action handled by the catalog UI domain.
 */
export type CatalogActions =
  | CatalogPageActions
  | CatalogCreateDialogActions
  | CatalogsCardActions
  | CatalogBulkAddDialogActions
  | CatalogDetailsCardActions
  | TokensCardActions;


/**
 * Narrows a queued app action to the catalog action union when its type is catalog-scoped.
 * @param a - Action from the global action queue.
 * @returns True when the action belongs to a catalog feature handler.
 */
export function isCatalogAction(a: AppAction): a is CatalogActions {
  return isCatalogPageAction(a)
    || isCatalogBulkAddDialogAction(a)
    || isCatalogCreateDialogAction(a)
    || isCatalogDetailsCardAction(a)
    || isCatalogsCardAction(a)
    || isTokensCardAction(a);
}

/**
 * Attempts to merge a pending catalog action with a same-type incoming action before enqueue.
 * @param pending - Action already waiting in the queue tail.
 * @param incoming - New action being enqueued.
 * @returns Coalesced catalog action, or null when no catalog coalescer applies.
 */
export function tryCoalesceCatalogAction(pending: AppAction, incoming: AppAction): CatalogActions | null {
  if (isCatalogBulkAddDialogAction(pending) && isCatalogBulkAddDialogAction(incoming)) {
    return tryCoalesceCatalogBulkAddDialogAction(pending, incoming);
  }
  if (isCatalogDetailsCardAction(pending) && isCatalogDetailsCardAction(incoming)) {
    return tryCoalesceCatalogDetailsCardAction(pending, incoming);
  }
  if (isTokensCardAction(pending) && isTokensCardAction(incoming)) {
    return tryCoalesceTokensCardAction(pending, incoming);
  }
  return null;
}
