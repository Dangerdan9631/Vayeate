import type { AppAction } from './app-action';

/**
 * Merges a pending action with an incoming action of the same type.
 * Used by coalescing policies registered for high-frequency action types.
 */
export type ActionCoalesceFn<A extends AppAction = AppAction> = (pending: A, incoming: A) => A;

/**
 * Returns the merged action for latest-only coalescing: the incoming action
 * fully replaces the pending one. Correct for any action whose payload is an
 * absolute value — only the final value matters.
 *
 * @param _pending - The action already waiting in the queue (ignored).
 * @param incoming - The newly enqueued action.
 * @returns The incoming action unchanged.
 */
export function coalesceLatest<A extends AppAction>(_pending: A, incoming: A): A {
  return incoming;
}

/**
 * Returns the merged action for sum-value coalescing: the `value` fields are
 * summed and all other fields are taken from the incoming action. Correct for
 * actions whose payload is a true relative increment — dropping intermediates
 * would silently discard accumulated movement.
 *
 * @param pending - The action already waiting in the queue.
 * @param incoming - The newly enqueued action.
 * @returns A copy of the incoming action with `value` equal to the sum of both.
 */
export function coalesceSumValue<A extends AppAction & { value: number }>(pending: A, incoming: A): A {
  return { ...incoming, value: pending.value + incoming.value };
}

/**
 * Wraps a type-specific merge function as a generic `ActionCoalesceFn`.
 * Preserves compile-time payload typing for a single action discriminant.
 *
 * @param fn - Merge logic for one `AppAction` type variant.
 * @returns The function cast for use in coalescing policy tables.
 */
export function actionCoalescer<T extends AppAction['type']>(
  fn: (
    pending: Extract<AppAction, { type: T }>,
    incoming: Extract<AppAction, { type: T }>,
  ) => Extract<AppAction, { type: T }>,
): ActionCoalesceFn {
  return fn as unknown as ActionCoalesceFn;
}
