import { tryCoalesceAppAction } from '../../app/actions/app-action-type';
import { tryCoalesceCatalogAction } from '../../catalog/actions/catalog-action-type';
import { tryCoalesceTemplateAction } from '../../template/actions/template-action-type';
import { tryCoalesceThemeAction } from '../../theme/actions/theme-action-type';
import type { AppAction } from './app-action';

export { actionCoalescer, coalesceLatest, coalesceSumValue } from './action-coalesce';
export type { ActionCoalesceFn } from './action-coalesce';

/**
 * Attempts to coalesce `incoming` into `pending`.
 *
 * Precondition: `pending.type === incoming.type` (enforced by `ActionQueue.enqueue`
 * before this router is invoked).
 *
 * Returns the merged action when a coalescing policy applies for that type, or
 * `null` when no coalescing is possible.
 */
export function tryCoalesce(pending: AppAction, incoming: AppAction): AppAction | null {
  return tryCoalesceAppAction(pending, incoming)
    ?? tryCoalesceCatalogAction(pending, incoming)
    ?? tryCoalesceTemplateAction(pending, incoming)
    ?? tryCoalesceThemeAction(pending, incoming);
}
