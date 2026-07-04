import { tryCoalesceAppAction } from '../../../actions/Common/app-action-type';
import { tryCoalesceCatalogAction } from '../../../actions/Catalog/catalog-action-type';
import { tryCoalesceTemplateAction } from '../../../actions/Template/template-action-type';
import { tryCoalesceThemeAction } from '../../../actions/Theme/theme-action-type';
import type { AppAction } from './app-action';

export { actionCoalescer, coalesceLatest, coalesceSumValue } from './action-coalesce';
export type { ActionCoalesceFn } from './action-coalesce';

/**
 * Attempts to coalesce `incoming` into `pending` by delegating to feature coalescing policies.
 * Precondition: `pending.type === incoming.type` (enforced by `ActionQueue.enqueue`).
 *
 * @param pending - The action already waiting in the queue.
 * @param incoming - The newly enqueued action of the same type.
 * @returns The merged action when a policy applies, or `null` when no coalescing is possible.
 */
export function tryCoalesce(pending: AppAction, incoming: AppAction): AppAction | null {
  return tryCoalesceAppAction(pending, incoming)
    ?? tryCoalesceCatalogAction(pending, incoming)
    ?? tryCoalesceTemplateAction(pending, incoming)
    ?? tryCoalesceThemeAction(pending, incoming);
}
